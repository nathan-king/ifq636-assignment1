import AppSidebar from '../components/AppSidebar';
import ClassList from '../components/ClassList';

const Classes = () => {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <AppSidebar active="classes" />

      <main className="flex-1 px-4 py-6 sm:px-8 md:px-10 lg:px-14 lg:py-16">
        <ClassList />
      </main>
    </div>
  );
};

export default Classes;
