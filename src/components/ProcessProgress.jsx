import React, { useState, useEffect } from 'react';

const ProcessProgress = ({ processInstanceId, onClose }) => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgressData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/process-progress/${processInstanceId}`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setProgressData(data);
                } else {
                    setError('Failed to load process progress');
                }
            } catch (error) {
                setError('Network error while loading progress');
                console.error('Error fetching progress:', error);
            } finally {
                setLoading(false);
            }
        };

        if (processInstanceId) {
            fetchProgressData();
        }
    }, [processInstanceId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    const formatDuration = (milliseconds) => {
        if (!milliseconds) return '-';
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
        } else if (hours > 0) {
            return `${hours}小时 ${minutes % 60}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p>加载流程进度中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button onClick={onClose} style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        关闭
                    </button>
                </div>
            </div>
        );
    }

    if (!progressData) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '800px',
                maxHeight: '90vh',
                width: '100%',
                overflow: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2>流程进度跟踪</h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#999'
                    }}>
                        ×
                    </button>
                </div>

                {/* Process Info */}
                <div style={{ padding: '20px' }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        <h3>{progressData.processDefinitionName}</h3>
                        <div><strong>流程实例ID:</strong> {progressData.processInstanceId}</div>
                        <div><strong>开始时间:</strong> {formatDate(progressData.startTime)}</div>
                        {progressData.endTime && (
                            <div><strong>结束时间:</strong> {formatDate(progressData.endTime)}</div>
                        )}
                        <div><strong>状态:</strong> <span style={{
                            color: progressData.isFinished ? '#28a745' : '#007bff',
                            fontWeight: 'bold'
                        }}>
                            {progressData.isFinished ? '已完成' : '进行中'}
                        </span></div>
                        <div><strong>进度:</strong> {progressData.progressPercentage}%</div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            backgroundColor: '#e9ecef',
                            height: '20px',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                backgroundColor: progressData.isFinished ? '#28a745' : '#007bff',
                                height: '100%',
                                width: `${progressData.progressPercentage}%`,
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                    </div>

                    {/* Leave Request Details */}
                    {progressData.variables && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            padding: '15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            border: '1px solid #ffeeba'
                        }}>
                            <h4>请假详情</h4>
                            <div><strong>请假类型:</strong> {progressData.variables.leaveType}</div>
                            <div><strong>开始日期:</strong> {progressData.variables.startDate}</div>
                            <div><strong>结束日期:</strong> {progressData.variables.endDate}</div>
                            <div><strong>请假天数:</strong> {progressData.variables.days} 天</div>
                            <div><strong>请假原因:</strong> {progressData.variables.reason}</div>
                            <div><strong>申请人:</strong> {progressData.variables.requester}</div>
                            {progressData.variables.approved !== undefined && (
                                <div><strong>审批结果:</strong> <span style={{
                                    color: progressData.variables.approved ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    {progressData.variables.approved ? '已批准' : '已拒绝'}
                                </span></div>
                            )}
                            {progressData.variables.reviewComments && (
                                <div><strong>审批意见:</strong> {progressData.variables.reviewComments}</div>
                            )}
                        </div>
                    )}

                    {/* Task Timeline */}
                    <div>
                        <h4>任务时间线</h4>
                        <div style={{ position: 'relative' }}>
                            {progressData.tasks.map((task, index) => (
                                <div key={task.id} style={{
                                    position: 'relative',
                                    paddingLeft: '40px',
                                    paddingBottom: '20px'
                                }}>
                                    {/* Timeline line */}
                                    {index < progressData.tasks.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '19px',
                                            top: '25px',
                                            bottom: '0',
                                            width: '2px',
                                            backgroundColor: '#dee2e6'
                                        }}></div>
                                    )}
                                    
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '10px',
                                        top: '10px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: task.status === 'completed' ? '#28a745' : 
                                                       task.status === 'active' ? '#007bff' : '#6c757d',
                                        border: '3px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}></div>

                                    {/* Task content */}
                                    <div style={{
                                        backgroundColor: task.status === 'completed' ? '#d4edda' : 
                                                       task.status === 'active' ? '#d1ecf1' : '#f8f9fa',
                                        padding: '15px',
                                        borderRadius: '4px',
                                        border: `1px solid ${task.status === 'completed' ? '#c3e6cb' : 
                                                              task.status === 'active' ? '#bee5eb' : '#dee2e6'}`
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                            {task.name}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            <div><strong>负责人:</strong> {task.assignee}</div>
                                            <div><strong>开始时间:</strong> {formatDate(task.startTime)}</div>
                                            {task.endTime && (
                                                <div><strong>完成时间:</strong> {formatDate(task.endTime)}</div>
                                            )}
                                            {task.duration && (
                                                <div><strong>用时:</strong> {formatDuration(task.duration)}</div>
                                            )}
                                            <div><strong>状态:</strong> <span style={{
                                                color: task.status === 'completed' ? '#28a745' : 
                                                      task.status === 'active' ? '#007bff' : '#6c757d',
                                                fontWeight: 'bold'
                                            }}>
                                                {task.status === 'completed' ? '已完成' : 
                                                 task.status === 'active' ? '进行中' : '等待中'}
                                            </span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid #ddd',
                    textAlign: 'right'
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessProgress;