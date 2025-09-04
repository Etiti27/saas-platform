export const Chip = ({ tone = 'gray', children }) => {
    const tones = {
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      red: 'bg-red-100 text-red-700 ring-red-200',
      amber: 'bg-amber-100 text-amber-700 ring-amber-200',
      green: 'bg-green-100 text-green-700 ring-green-200',
      blue: 'bg-blue-100 text-blue-700 ring-blue-200',
      violet: 'bg-violet-100 text-violet-700 ring-violet-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone] || tones.gray}`}>
        {children}
      </span>
    );
  };