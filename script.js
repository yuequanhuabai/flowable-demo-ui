// OAuth2 PKCE Client Implementation

class OAuth2PKCEClient {
    constructor() {
        this.config = {
            clientId: 'demo-client-id',
            authorizationServerUrl: 'http://localhost:8085',
            redirectUri: 'http://localhost:3000/callback',
            apiBaseUrl: 'http://localhost:8085/api',
            scopes: ['openid', 'profile', 'read', 'write']
        };
        
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.handleCallback();
    }

    bindEvents() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // API 測試按鈕
        document.getElementById('publicApiBtn')?.addEventListener('click', () => this.testPublicApi());
        document.getElementById('userApiBtn')?.addEventListener('click', () => this.testUserApi());
        document.getElementById('adminApiBtn')?.addEventListener('click', () => this.testAdminApi());
        document.getElementById('tokenInfoBtn')?.addEventListener('click', () => this.testTokenInfo());
    }

    // PKCE 輔助函數
    base64UrlEncode(str) {
        return btoa(String.fromCharCode(...new Uint8Array(str)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64UrlEncode(array);
    }

    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64UrlEncode(hash);
    }

    generateState() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return this.base64UrlEncode(array);
    }

    // OAuth2 PKCE 流程
    async login() {
        try {
            console.log('開始 OAuth2 PKCE 登入流程...');
            
            // 生成 PKCE 參數
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            const state = this.generateState();
            
            // 存儲 PKCE 參數
            localStorage.setItem('oauth2_code_verifier', codeVerifier);
            localStorage.setItem('oauth2_state', state);
            
            // 構建授權 URL
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                scope: this.config.scopes.join(' '),
                state: state,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256'
            });
            
            const authUrl = `${this.config.authorizationServerUrl}/oauth2/authorize?${params}`;
            console.log('重定向到授權服務器:', authUrl);
            
            // 重定向到授權服務器
            window.location.href = authUrl;
            
        } catch (error) {
            console.error('登入失敗:', error);
            this.showError('登入失敗: ' + error.message);
        }
    }

    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            this.showError('授權失敗: ' + (urlParams.get('error_description') || error));
            this.showLoginPage();
            return;
        }

        if (code) {
            this.showCallbackPage();
            
            try {
                // 驗證 state
                const storedState = localStorage.getItem('oauth2_state');
                if (state !== storedState) {
                    throw new Error('Invalid state parameter - 可能的 CSRF 攻擊');
                }

                // 用授權碼換取訪問令牌
                await this.exchangeCodeForTokens(code);
                
                // 顯示成功消息
                this.showCallbackSuccess();
                
                // 延遲跳轉到儀表板
                setTimeout(() => {
                    this.showDashboard();
                    // 清理 URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 2000);
                
            } catch (error) {
                console.error('回調處理失敗:', error);
                this.showCallbackError(error.message);
            }
        }
    }

    async exchangeCodeForTokens(code) {
        const codeVerifier = localStorage.getItem('oauth2_code_verifier');
        
        if (!codeVerifier) {
            throw new Error('缺少 code_verifier');
        }

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.config.clientId,
            code: code,
            redirect_uri: this.config.redirectUri,
            code_verifier: codeVerifier
        });

        const response = await fetch(`${this.config.authorizationServerUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`令牌交換失敗: ${errorData.error_description || errorData.error}`);
        }

        const tokens = await response.json();
        console.log('獲得令牌:', tokens);
        
        // 存儲令牌
        localStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        
        // 存儲過期時間
        const expiresAt = Date.now() + (tokens.expires_in * 1000);
        localStorage.setItem('token_expires_at', expiresAt.toString());
        
        // 清理 PKCE 參數
        localStorage.removeItem('oauth2_code_verifier');
        localStorage.removeItem('oauth2_state');
        
        return tokens;
    }

    async checkAuthStatus() {
        const accessToken = localStorage.getItem('access_token');
        const expiresAt = localStorage.getItem('token_expires_at');
        
        if (!accessToken || !expiresAt) {
            this.showLoginPage();
            return;
        }
        
        if (Date.now() >= parseInt(expiresAt)) {
            console.log('令牌已過期');
            this.logout();
            return;
        }
        
        try {
            // 驗證令牌並獲取用戶信息
            const userInfo = await this.fetchUserProfile();
            this.currentUser = userInfo;
            this.showDashboard();
        } catch (error) {
            console.error('令牌驗證失敗:', error);
            this.logout();
        }
    }

    async fetchUserProfile() {
        const response = await this.apiRequest('/user/profile');
        return response;
    }

    logout() {
        localStorage.clear();
        this.currentUser = null;
        this.showLoginPage();
    }

    // API 請求封裝
    async apiRequest(endpoint, options = {}) {
        const accessToken = localStorage.getItem('access_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // API 測試方法
    async testPublicApi() {
        try {
            const result = await this.apiRequest('/public/info');
            this.showApiResult('publicApiResult', result);
        } catch (error) {
            this.showApiError('publicApiResult', error.message);
        }
    }

    async testUserApi() {
        try {
            const result = await this.apiRequest('/user/profile');
            this.showApiResult('userApiResult', result);
        } catch (error) {
            this.showApiError('userApiResult', error.message);
        }
    }

    async testAdminApi() {
        try {
            const result = await this.apiRequest('/admin/action', {
                method: 'POST',
                body: JSON.stringify({ action: 'test', data: 'demo' })
            });
            this.showApiResult('adminApiResult', result);
        } catch (error) {
            this.showApiError('adminApiResult', error.message);
        }
    }

    async testTokenInfo() {
        try {
            const result = await this.apiRequest('/token/info');
            this.showApiResult('tokenInfoResult', result);
        } catch (error) {
            this.showApiError('tokenInfoResult', error.message);
        }
    }

    // UI 控制方法
    showLoginPage() {
        this.hideAllPages();
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
    }

    showDashboard() {
        this.hideAllPages();
        document.getElementById('dashboardPage').style.display = 'block';
        
        if (this.currentUser) {
            document.getElementById('username').textContent = this.currentUser.username || 'Unknown User';
            document.getElementById('userInfo').style.display = 'flex';
            this.updateUserDetails(this.currentUser);
        }
    }

    showCallbackPage() {
        this.hideAllPages();
        document.getElementById('callbackPage').style.display = 'block';
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
    }

    showCallbackSuccess() {
        const message = document.getElementById('callbackMessage');
        if (message) {
            message.textContent = '授權成功！正在跳轉到應用...';
            message.className = 'success';
        }
    }

    showCallbackError(errorMsg) {
        const message = document.getElementById('callbackMessage');
        if (message) {
            message.textContent = '授權失敗: ' + errorMsg;
            message.className = 'error';
        }
    }

    updateUserDetails(userInfo) {
        const userDetails = document.getElementById('userDetails');
        if (userDetails && userInfo) {
            userDetails.innerHTML = `
                <p><strong>用戶名:</strong> ${userInfo.username || 'N/A'}</p>
                <p><strong>權限範圍:</strong> ${(userInfo.scopes || []).join(', ') || 'N/A'}</p>
                <p><strong>客戶端ID:</strong> ${userInfo.clientId || 'N/A'}</p>
                <p><strong>令牌頒發時間:</strong> ${userInfo.issuedAt ? new Date(userInfo.issuedAt * 1000).toLocaleString() : 'N/A'}</p>
                <p><strong>令牌過期時間:</strong> ${userInfo.expiresAt ? new Date(userInfo.expiresAt * 1000).toLocaleString() : 'N/A'}</p>
            `;
        }
    }

    showApiResult(elementId, result) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = JSON.stringify(result, null, 2);
            element.style.display = 'block';
        }
    }

    showApiError(elementId, errorMsg) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `錯誤: ${errorMsg}`;
            element.style.display = 'block';
            element.style.color = '#dc3545';
        }
    }

    showError(message) {
        alert(message); // 簡單的錯誤顯示，可以後續改進
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    console.log('OAuth2 PKCE Demo 應用加載完成');
    window.oauth2Client = new OAuth2PKCEClient();
});