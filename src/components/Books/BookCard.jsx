import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:scale-105 transition-transform duration-300">
      <Link
        to={`/books/${book.id}`}
        className="block w-full focus:outline-none"
      >
        <div className="relative w-full h-72 overflow-hidden">
          <img
            src={book.imageUrl}
            alt={book.name}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <Link
          to={`/books/${book.id}`}
          className="block text-left focus:outline-none"
        >
          <h3
            className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 truncate"
            title={book.name}
          >
            {book.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3 flex-grow min-h-[60px] line-clamp-3">
          {book.description}
        </p>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-indigo-600 mb-4">
            ${book.price.toFixed(2)}
          </p>
          <Link
            to={`/books/${book.id}`}
            className="block w-full text-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
