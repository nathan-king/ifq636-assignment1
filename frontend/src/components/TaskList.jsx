import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">{task.title}</h2>
          <p className="mt-1 text-base text-slate-700">{task.description}</p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setEditingTask(task)}
              className="h-10 rounded-md bg-amber-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="h-10 rounded-md bg-red-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
