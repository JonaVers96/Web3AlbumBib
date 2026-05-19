import { useAuth } from "../../contexts/AuthContext";

const AdminHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-neutral-800 p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-2">Admin</h1>
      <p className="text-neutral-300">
        Welkom {user?.firstName}. Hier beheer je albums, artists en users.
      </p>
    </div>
  );
};

export default AdminHomePage;
