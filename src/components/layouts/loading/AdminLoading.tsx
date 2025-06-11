import AdminLayout from "../AdminLayout";

export const AdminLoading = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="h-16 w-64 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-md p-6 space-y-2 shadow-md"
            >
              <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
