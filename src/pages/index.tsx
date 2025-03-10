// HomePage.tsx

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { addUser, deleteUser, fetchUsers, updateUser } from "./api/pardCRUD";
// import { fetchUsers, addUser, deleteUser, updateUser } from "./api";  // api.ts에서 함수 임포트

interface User {
  id: number;
  name: string;
  age: number;
  part: string;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", age: "", part: "" });
  const [selectedPart, setSelectedPart] = useState<"web" | "ios" | "server">(
    "web"
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUser = useCallback(() => {
    fetchUsers(selectedPart).then((usersData) => {
      setUsers(usersData);
    });
  }, [selectedPart]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.age || !newUser.part) return;
    await addUser(newUser);
    fetchUser();
    setNewUser({ name: "", age: "", part: "" });
  };

  const handleDeleteUser = async (id: number) => {
    await deleteUser(id);
    fetchUser();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    await updateUser(editingUser);
    setEditingUser(null);
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="bg-[#343434] min-h-screen flex flex-col items-center text-white p-6">
      {/* 헤더 */}
      <h1 className="font-serif font-extrabold text-2xl mb-4">
        PARD - 5th Seminar CRUD
      </h1>

      {/* 로고 */}
      <Image
        src="/PARD.png"
        alt="Pard Logo"
        width={200}
        height={200}
        priority
        className="mb-6 w-auto h-auto"
      />

      {/* Part 선택 버튼 */}
      <div className="mb-4 flex space-x-3">
        {["web", "ios", "server"].map((part) => (
          <button
            key={part}
            className={`px-4 py-2 rounded transition ${
              selectedPart === part
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedPart(part as "web" | "ios" | "server")}
          >
            {part.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 유저 테이블 */}
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">User Table</h2>

        <table className="w-full border-collapse border border-gray-600">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="border p-3">Name</th>
              <th className="border p-3">Age</th>
              <th className="border p-3">Part</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.length ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="border p-3">{user.name}</td>
                  <td className="border p-3">{user.age}</td>
                  <td className="border p-3">{user.part}</td>
                  <td className="border p-3 text-center">
                    <button onClick={() => handleDeleteUser(user.id)}>
                      ❎
                    </button>
                    <button
                      className="px-6 "
                      onClick={() => setEditingUser(user)}
                    >
                      🔍
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-3">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 유저 추가 & 수정 폼 */}
        <div className="mt-6 flex space-x-3">
          <input
            className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-black"
            placeholder="Name"
            value={editingUser ? editingUser.name : newUser.name}
            onChange={(e) =>
              editingUser
                ? setEditingUser({ ...editingUser, name: e.target.value })
                : setNewUser({ ...newUser, name: e.target.value })
            }
          />
          <input
            type="number"
            className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-black"
            placeholder="Age"
            value={editingUser ? editingUser.age : newUser.age}
            onChange={(e) =>
              editingUser
                ? setEditingUser({
                    ...editingUser,
                    age: Number(e.target.value),
                  })
                : setNewUser({ ...newUser, age: e.target.value })
            }
          />
          <input
            className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-black"
            placeholder="Part"
            value={editingUser ? editingUser.part : newUser.part}
            onChange={(e) =>
              editingUser
                ? setEditingUser({ ...editingUser, part: e.target.value })
                : setNewUser({ ...newUser, part: e.target.value })
            }
          />
          {editingUser ? (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={handleUpdateUser}
            >
              Update
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={handleAddUser}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
