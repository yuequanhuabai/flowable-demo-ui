import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProcessProgress from './ProcessProgress';

const HomePage = () => {
    const { user } = useAuth();
    const [leaveRequest, setLeaveRequest] = useState({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
        days: 1
    });
    const [runningProcesses, setRunningProcesses] = useState([]);
    const [processHistory, setProcessHistory] = useState([]);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedProcessId, setSelectedProcessId] = useState(null);

    useEffect(() => {
        fetchRunningProcesses();
        fetchProcessHistory();
    }, []);

    const fetchRunningProcesses = async () => {
        try {
            const response = await fetch('/api/running-processes', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setRunningProcesses(data);
            }
        } catch (error) {
            console.error('Error fetching running processes:', error);
        }
    };

    const fetchProcessHistory = async () => {
        try {
            const response = await fetch('/api/process-history', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProcessHistory(data.slice(0, 5)); // Show latest 5
            }
        } catch (error) {
            console.error('Error fetching process history:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeaveRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateDays = () => {
        if (leaveRequest.startDate && leaveRequest.endDate) {
            const start = new Date(leaveRequest.startDate);
            const end = new Date(leaveRequest.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setLeaveRequest(prev => ({ ...prev, days: diffDays }));
        }
    };

    useEffect(() => {
        calculateDays();
    }, [leaveRequest.startDate, leaveRequest.endDate]);

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        
        if (!leaveRequest.startDate || !leaveRequest.endDate || !leaveRequest.reason) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/start-leave-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(leaveRequest)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Leave request submitted successfully! Process ID: ${result.processInstanceId}`);
                
                // Reset form
                setLeaveRequest({
                    leaveType: 'vacation',
                    startDate: '',
                    endDate: '',
                    reason: '',
                    days: 1
                });
                
                // Refresh data
                fetchRunningProcesses();
            } else {
                const error = await response.json();
                alert('Failed to submit leave request: ' + error.error);
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert('An error occurred while submitting the leave request.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const viewProcessProgress = (processInstanceId) => {
        setSelectedProcessId(processInstanceId);
        setShowProgressModal(true);
    };

    const closeProgressModal = () => {
        setShowProgressModal(false);
        setSelectedProcessId(null);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px' }}>
            <h1>Welcome, {user ? user.username : 'Guest'}!</h1>
            <p>Submit leave requests and track your workflow processes.</p>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Leave Request Form */}
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <h2>Submit Leave Request</h2>
                    <form onSubmit={submitLeaveRequest} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="leaveType">Leave Type:</label>
                            <select
                                id="leaveType"
                                name="leaveType"
                                value={leaveRequest.leaveType}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="vacation">Vacation</option>
                                <option value="sick">Sick Leave</option>
                                <option value="personal">Personal Leave</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={leaveRequest.startDate}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={leaveRequest.endDate}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="days">Number of Days:</label>
                            <input
                                type="number"
                                id="days"
                                name="days"
                                value={leaveRequest.days}
                                readOnly
                                style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="reason">Reason:</label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={leaveRequest.reason}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                style={{ width: '100%', padding: '8px', marginTop: '5px', resize: 'vertical' }}
                                placeholder="Please provide reason for your leave request..."
                            />
                        </div>

                        <button 
                            type="submit"
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Submit Leave Request
                        </button>
                    </form>
                </div>

                {/* Process Status */}
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <h2>Current Processes</h2>
                    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        {runningProcesses.length > 0 ? (
                            <div>
                                {runningProcesses.map((process, index) => (
                                    <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                        <strong>{process.processDefinitionName}</strong>
                                        <div>Started: {formatDate(process.startTime)}</div>
                                        <div>Type: {process.variables?.leaveType || 'N/A'}</div>
                                        <div>Days: {process.variables?.days || 'N/A'}</div>
                                        <div>Status: <span style={{ 
                                            color: process.status === 'Pending Action' ? '#dc3545' : '#ffc107',
                                            fontWeight: 'bold'
                                        }}>{process.status === 'Pending Action' ? '需要处理' : '等待他人'}</span></div>
                                        {process.currentTask && (
                                            <div>Current Task: {process.currentTask}</div>
                                        )}
                                        {process.currentAssignee && process.status === 'Waiting Others' && (
                                            <div>Assignee: {process.currentAssignee}</div>
                                        )}
                                        <button 
                                            onClick={() => viewProcessProgress(process.processInstanceId)}
                                            style={{ 
                                                marginTop: '10px',
                                                padding: '5px 10px',
                                                backgroundColor: '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            查看进度
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No running processes</p>
                        )}
                    </div>

                    <h2>Recent History</h2>
                    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                        {processHistory.length > 0 ? (
                            <div>
                                {processHistory.map((process, index) => (
                                    <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                        <strong>{process.processDefinitionName}</strong>
                                        <div>Completed: {formatDate(process.endTime)}</div>
                                        <div>Type: {process.variables?.leaveType || 'N/A'}</div>
                                        <div>Duration: {Math.round(process.duration / (1000 * 60 * 60 * 24))} days</div>
                                        <div>Status: <span style={{ color: process.variables?.approved ? '#28a745' : '#dc3545' }}>
                                            {process.variables?.approved ? 'Approved' : 'Rejected'}
                                        </span></div>
                                        <button 
                                            onClick={() => viewProcessProgress(process.processInstanceId)}
                                            style={{ 
                                                marginTop: '10px',
                                                padding: '5px 10px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            查看详情
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No completed processes</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Process Progress Modal */}
            {showProgressModal && selectedProcessId && (
                <ProcessProgress 
                    processInstanceId={selectedProcessId}
                    onClose={closeProgressModal}
                />
            )}
        </div>
    );
};

export default HomePage;
