export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selected === category.id
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-brown/70 hover:bg-brown/5 border border-brown/10'
          }`}
        >
          <span>{category.emoji}</span>
          <span className="text-sm font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
}
