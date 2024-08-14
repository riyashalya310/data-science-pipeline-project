import React, { useState, useEffect } from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import "./index.css";

const AdminDashboard = (props) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const { history } = props;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5001/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        setError("Error fetching users");
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://127.0.0.1:5001/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Error deleting user");
    }
  };

  const handleUpdate = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:5001/admin/users/${selectedUser.id}`,
        selectedUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(
        users.map((user) => (user.id === selectedUser.id ? selectedUser : user))
      );
      setShowModal(false);
    } catch (err) {
      setError("Error updating user");
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:5001/admin/users`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers([...users, newUser]);
      setShowCreateUserModal(false);
    } catch (err) {
      setError("Error creating user");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    history.push("/login");
  };

  const handlePrevious = () => {
    history.goBack();
  };

  return (
    <div className="admin-dashboard">
      {error && <p className="error">{error}</p>}
      <div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <button onClick={() => setShowCreateUserModal(true)} className="insert-user-button">
          Insert User
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleUpdate(user)}>Update</button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update User</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={selectedUser.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={selectedUser.email}
                onChange={handleInputChange}
              />
            </label>
            <div style={{display: "flex",flexDirection: "row",justifyContent: "center"}}>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New User</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
              />
            </label>
            <div style={{display: "flex",flexDirection: "row",justifyContent: "center"}}>
              <button onClick={handleCreateUser}>Create</button>
              <button onClick={() => setShowCreateUserModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withRouter(AdminDashboard);
