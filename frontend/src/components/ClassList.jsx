const classes = [
  {
    id: 'yoga',
    class: 'Yoga',
    instructor: 'Jack Jones',
    date: '3 June 2026',
    time: '7:00 PM',
    capacity: '20/20',
  },
  {
    id: 'pilates',
    class: 'Pilates',
    instructor: 'Jessica Smith',
    date: '4 June 2026',
    time: '7:00 PM',
    capacity: '8/15',
  },
  {
    id: 'pump',
    class: 'Pump',
    instructor: 'Thomas Max',
    date: '6 June 2026',
    time: '7:00 PM',
    capacity: '12/18',
  },
];

const ClassList = () => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-[#eefaff]">
            <tr>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Class</th>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Instructor</th>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Date</th>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Time</th>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Capacity</th>
              <th className="px-6 py-5 text-base font-bold text-slate-950">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((fitnessClass) => (
              <tr key={fitnessClass.id} className="border-t border-slate-200 transition hover:bg-slate-50">
                <td className="px-6 py-5 text-base font-medium text-slate-950">{fitnessClass.class}</td>
                <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.instructor}</td>
                <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.date}</td>
                <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.time}</td>
                <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.capacity}</td>
                <td className="px-6 py-5">
                  <button
                    type="button"
                    className="h-10 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;
