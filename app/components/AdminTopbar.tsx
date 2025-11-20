// // app/admin/components/AdminTopbar.tsx
// "use client";
// import { useRouter } from "next/navigation";

// export default function AdminTopbar() {
//   const router = useRouter();
//   const signOut = () => {
//     localStorage.removeItem("admin_token");
//     router.push("/admin/login");
//   };

//   return (
//     <div className="flex items-center justify-between p-4 bg-white border-b">
//       <div>
//         <h3 className="font-semibold">Library Admin</h3>
//       </div>
//       {/* <div>
//         <button onClick={signOut} className="px-3 py-1 bg-red-500 text-white rounded">Sign out</button>
//       </div> */}
//     </div>
//   );
// }
