import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="text-center">
        <p className="text-7xl font-black text-primary-200">404</p>
        <p className="text-lg font-semibold text-primary-800 mt-2">
          Page not found
        </p>
        <p className="text-slate-400 text-sm mt-1">
          The page you are looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 inline-flex btn-primary text-sm px-5 py-2.5 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
