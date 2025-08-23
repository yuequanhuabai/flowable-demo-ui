import React, { useState, useEffect } from 'react';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskForm, setTaskForm] = useState({});

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                console.error('Failed to fetch tasks');
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        
        // Initialize form based on task type
        if (task.name === 'Submit Leave Request') {
            setTaskForm({
                leaveType: task.variables?.leaveType || 'vacation',
                startDate: task.variables?.startDate || '',
                endDate: task.variables?.endDate || '',
                reason: task.variables?.reason || '',
                days: task.variables?.days || 1
            });
        } else if (task.name === 'Manager Review') {
            setTaskForm({
                approved: null,
                reviewComments: ''
            });
        } else {
            setTaskForm({});
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaskForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const completeTask = async (taskId) => {
        try {
            const response = await fetch(`/api/complete-task/${taskId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(taskForm)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                setSelectedTask(null);
                setTaskForm({});
                fetchTasks();
            } else {
                const error = await response.json();
                alert('Failed to complete task: ' + error.error);
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('An error occurred while completing the task.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const renderTaskForm = () => {
        if (!selectedTask) return null;

        if (selectedTask.name === 'Submit Leave Request') {
            return (
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h3>Complete Leave Request Submission</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label>Leave Type:</label>
                        <select
                            name="leaveType"
                            value={taskForm.leaveType || ''}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        >
                            <option value="vacation">Vacation</option>
                            <option value="sick">Sick Leave</option>
                            <option value="personal">Personal Leave</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Start Date:</label>
                        <input
                            type="date"
                            name="startDate"
                            value={taskForm.startDate || ''}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>End Date:</label>
                        <input
                            type="date"
                            name="endDate"
                            value={taskForm.endDate || ''}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Number of Days:</label>
                        <input
                            type="number"
                            name="days"
                            value={taskForm.days || ''}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Reason:</label>
                        <textarea
                            name="reason"
                            value={taskForm.reason || ''}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '100%', padding: '8px', marginTop: '5px', resize: 'vertical' }}
                        />
                    </div>
                </div>
            );
        } else if (selectedTask.name === 'Manager Review') {
            return (
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h3>Manager Review</h3>
                    
                    {/* Display leave request details */}
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                        <h4>Leave Request Details:</h4>
                        <div><strong>Employee:</strong> {selectedTask.variables?.requester}</div>
                        <div><strong>Leave Type:</strong> {selectedTask.variables?.leaveType}</div>
                        <div><strong>Start Date:</strong> {selectedTask.variables?.startDate}</div>
                        <div><strong>End Date:</strong> {selectedTask.variables?.endDate}</div>
                        <div><strong>Days:</strong> {selectedTask.variables?.days}</div>
                        <div><strong>Reason:</strong> {selectedTask.variables?.reason}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Decision:</label>
                        <div style={{ marginTop: '5px' }}>
                            <label style={{ marginRight: '20px' }}>
                                <input
                                    type="radio"
                                    name="approved"
                                    value="true"
                                    checked={taskForm.approved === 'true'}
                                    onChange={handleFormChange}
                                />
                                Approve
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="approved"
                                    value="false"
                                    checked={taskForm.approved === 'false'}
                                    onChange={handleFormChange}
                                />
                                Reject
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Review Comments:</label>
                        <textarea
                            name="reviewComments"
                            value={taskForm.reviewComments || ''}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '100%', padding: '8px', marginTop: '5px', resize: 'vertical' }}
                            placeholder="Add your review comments here..."
                        />
                    </div>
                </div>
            );
        } else if (selectedTask.name.includes('Process') && selectedTask.name.includes('Leave')) {
            return (
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h3>{selectedTask.name}</h3>
                    
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                        <h4>Leave Request Result:</h4>
                        <div><strong>Status:</strong> {selectedTask.variables?.approved ? 'Approved' : 'Rejected'}</div>
                        <div><strong>Leave Type:</strong> {selectedTask.variables?.leaveType}</div>
                        <div><strong>Days:</strong> {selectedTask.variables?.days}</div>
                        {selectedTask.variables?.reviewComments && (
                            <div><strong>Manager Comments:</strong> {selectedTask.variables.reviewComments}</div>
                        )}
                    </div>
                    
                    <p>Click "Acknowledge" to complete this notification.</p>
                </div>
            );
        }

        return <div>Task details not available.</div>;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px' }}>
            <h1>My Tasks</h1>
            <p>Manage your pending workflow tasks.</p>
            <button 
                onClick={fetchTasks}
                style={{ 
                    padding: '10px 15px', 
                    marginBottom: '20px', 
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Refresh Tasks
            </button>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Task List */}
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <h2>Pending Tasks ({tasks.length})</h2>
                    {tasks.length > 0 ? (
                        <div>
                            {tasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    style={{ 
                                        border: '1px solid #ddd', 
                                        padding: '15px', 
                                        marginBottom: '15px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTask?.id === task.id ? '#e3f2fd' : 'white'
                                    }}
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <h3>{task.name}</h3>
                                    <div><strong>Created:</strong> {formatDate(task.createTime)}</div>
                                    <div><strong>Process:</strong> {task.processInstanceId?.substring(0, 8)}...</div>
                                    
                                    {task.variables?.leaveType && (
                                        <div><strong>Leave Type:</strong> {task.variables.leaveType}</div>
                                    )}
                                    
                                    <div style={{ 
                                        marginTop: '10px', 
                                        padding: '5px 10px', 
                                        backgroundColor: '#007bff', 
                                        color: 'white', 
                                        borderRadius: '4px',
                                        display: 'inline-block',
                                        fontSize: '12px'
                                    }}>
                                        Click to handle
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            border: '1px solid #ddd', 
                            padding: '30px', 
                            textAlign: 'center',
                            borderRadius: '8px',
                            color: '#666'
                        }}>
                            <p>No pending tasks</p>
                            <p>Great job! You're all caught up.</p>
                        </div>
                    )}
                </div>

                {/* Task Details & Form */}
                <div style={{ flex: '1', minWidth: '400px' }}>
                    <h2>Task Details</h2>
                    {selectedTask ? (
                        <div>
                            {renderTaskForm()}
                            
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => completeTask(selectedTask.id)}
                                    style={{ 
                                        padding: '12px 30px', 
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        fontSize: '16px'
                                    }}
                                >
                                    {selectedTask.name === 'Manager Review' ? 'Submit Decision' : 
                                     selectedTask.name.includes('Process') ? 'Acknowledge' : 'Complete Task'}
                                </button>
                                
                                <button 
                                    onClick={() => {setSelectedTask(null); setTaskForm({});}}
                                    style={{ 
                                        padding: '12px 30px', 
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ 
                            border: '1px solid #ddd', 
                            padding: '30px', 
                            textAlign: 'center',
                            borderRadius: '8px',
                            color: '#666'
                        }}>
                            <p>Select a task from the list to view details and take action.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TasksPage;
