import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

if (!API_URL) {
  throw new Error("🚨 API_URL이 정의되지 않았습니다! .env.local을 확인하세요.");
}

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
  ); // 초기값 설정
  const [editingUser, setEditingUser] = useState<User | null>(null); // 수정 중인 사용자 저장

  // ✅ useCallback으로 fetchUsers를 메모이제이션
  const fetchUser = useCallback(() => {
    axios
      .get(`${API_URL}?part=${selectedPart}`)
      .then((res) => {
        console.log("📌 API 응답 데이터:", res.data);
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.error("🚨 API 응답이 배열이 아님:", res.data);
          setUsers([]);
        }
      })
      .catch((error) => {
        console.error("🚨 데이터 불러오기 실패:", error);
        setUsers([]);
      });
  }, [selectedPart]); // ✅ selectedPart가 변경될 때만 fetchUsers가 변경됨

  const addUser = async () => {
    if (!newUser.name || !newUser.age || !newUser.part) return;
    try {
      const res = await axios.post(API_URL, newUser);
      console.log("🚨 서버 응답:", res);

      // 새 사용자 추가 후 사용자 목록을 다시 가져옴
      fetchUser(); // 새로 추가된 사용자를 포함한 데이터를 다시 가져옴

      setNewUser({ name: "", age: "", part: "" }); // 입력 필드 초기화
    } catch (error) {
      console.error("🚨 사용자 추가 실패:", error);
    }
  };

  // ✅ 유저 삭제 기능
  const deleteUser = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`); // API 호출
      fetchUser(); // 삭제 후 목록 갱신
    } catch (error) {
      console.error("🚨 사용자 삭제 실패:", error);
    }
  };

  // ✅ 유저 수정 기능 (PATCH 요청)
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      await axios.patch(`${API_URL}/${editingUser.id}`, {
        name: editingUser.name,
        age: editingUser.age,
        part: editingUser.part,
      });

      setEditingUser(null); // 수정 완료 후 초기화
      fetchUser(); // 최신 데이터 반영
    } catch (error) {
      console.error("🚨 사용자 수정 실패:", error);
    }
  };

  // 데이터 가져오기
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); //의존성 배열에 대해 설명하기

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
                  {/* 고유한 key 값으로 user.id 사용 */}
                  <td className="border p-3">{user.name}</td>
                  <td className="border p-3">{user.age}</td>
                  <td className="border p-3">{user.part}</td>
                  <td className=" border p-3 text-center">
                    <div className="flex justify-between">
                      <div></div>
                      <button className="" onClick={() => deleteUser(user.id)}>
                        ❎
                      </button>
                      <button
                        className="px-6 "
                        onClick={() => setEditingUser(user)}
                      >
                        🔍
                      </button>
                      <div></div>
                    </div>
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
              onClick={updateUser}
            >
              Update
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={addUser}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
