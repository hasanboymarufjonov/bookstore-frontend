import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiService } from "../services/apiService";
import {
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineBookOpen,
  HiOutlineXCircle,
  HiPencilSquare,
  HiOutlinePencil,
} from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";

const Loader = ({ message = "Loading data..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
    <p className="text-lg text-slate-600">{message}</p>
  </div>
);

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [isSubmittingAddModal, setIsSubmittingAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [addImageFile, setAddImageFile] = useState(null);

  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [isSubmittingEditModal, setIsSubmittingEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editBookFormState, setEditBookFormState] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const BOOKS_PER_PAGE_ADMIN = 10;

  const baseButtonClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out";
  const sizeMdClasses = "py-2 px-4 text-sm sm:text-base";
  const sizeSmClasses = "py-1.5 px-3 text-xs";

  const primaryButtonClasses = `${baseButtonClasses} ${sizeMdClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800`;
  const secondaryButtonClasses = `${baseButtonClasses} ${sizeMdClasses} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 active:bg-slate-300`;
  const paginationButtonActiveClasses = `${baseButtonClasses} ${sizeSmClasses} bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500`;
  const paginationButtonDefaultClasses = `${baseButtonClasses} ${sizeSmClasses} bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400`;

  const inputLabelClasses = "block text-sm font-medium text-slate-700 mb-1";
  const textInputClasses =
    "block w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 placeholder-slate-400 transition-shadow duration-150 disabled:bg-slate-50 disabled:text-slate-500";
  const fileInputClasses =
    "mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer";

  const fetchBooks = useCallback(
    async (pageNum) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getBooks({
          page: pageNum,
          limit: BOOKS_PER_PAGE_ADMIN,
        });
        setBooks(response.data || []);
        setTotalPages(response.totalPages || 1);
        if (
          pageNum > (response.totalPages || 1) &&
          (response.totalPages || 1) > 0
        ) {
          const lastValidPage = response.totalPages || 1;
          setCurrentPage(lastValidPage);
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("page", lastValidPage.toString());
          setSearchParams(newSearchParams, { replace: true });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch books.");
      } finally {
        setLoading(false);
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [searchParams, currentPage]);

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, fetchBooks]);

  const handleDeleteBook = async (bookId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    ) {
      setActionMessage({ type: "", text: "" });
      try {
        await apiService.deleteBook(bookId);
        setActionMessage({
          type: "success",
          text: "Book deleted successfully.",
        });
        fetchBooks(currentPage);
      } catch (err) {
        setActionMessage({
          type: "error",
          text: `Failed to delete book: ${err.data?.message || err.message}`,
        });
      }
    }
  };

  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAddImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewBook((prev) => ({ ...prev, imageUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setAddImageFile(null);
      setNewBook((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    setActionMessage({ type: "", text: "" });
    setIsSubmittingAddModal(true);

    const formData = new FormData();
    formData.append("name", newBook.name);
    formData.append("price", newBook.price);
    formData.append("description", newBook.description);

    if (addImageFile) {
      formData.append("image", addImageFile);
    } else if (newBook.imageUrl && !newBook.imageUrl.startsWith("data:")) {
      formData.append("imageUrl", newBook.imageUrl);
    }

    try {
      await apiService.createBook(formData);
      setActionMessage({ type: "success", text: "Book added successfully!" });
      setShowAddBookModal(false);
      setNewBook({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
      });
      setAddImageFile(null);
      if (currentPage !== 1) {
        setCurrentPage(1);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", "1");
        setSearchParams(newSearchParams, { replace: true });
      } else {
        fetchBooks(1);
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: `Failed to add book: ${err.data?.message || err.message}`,
      });
    } finally {
      setIsSubmittingAddModal(false);
    }
  };

  const openEditModal = (bookToEdit) => {
    setEditingBook(bookToEdit);
    setEditBookFormState({
      name: bookToEdit.name || "",
      price: bookToEdit.price?.toString() || "",
      description: bookToEdit.description || "",
      imageUrl: bookToEdit.imageUrl || "",
    });
    setEditImageFile(null);
    setActionMessage({ type: "", text: "" });
    setShowEditBookModal(true);
  };

  const handleEditBookChange = (e) => {
    const { name, value } = e.target;
    setEditBookFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditBookFormState((prev) => ({
          ...prev,
          imageUrl: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setEditImageFile(null);

      setEditBookFormState((prev) => ({
        ...prev,
        imageUrl: editingBook?.imageUrl || "",
      }));
    }
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    setActionMessage({ type: "", text: "" });
    setIsSubmittingEditModal(true);

    const formData = new FormData();
    formData.append("name", editBookFormState.name);
    formData.append("price", editBookFormState.price);
    formData.append("description", editBookFormState.description);

    if (editImageFile) {
      formData.append("image", editImageFile);
    } else if (
      editBookFormState.imageUrl &&
      editBookFormState.imageUrl !== editingBook.imageUrl &&
      !editBookFormState.imageUrl.startsWith("data:")
    ) {
      formData.append("imageUrl", editBookFormState.imageUrl);
    }

    try {
      await apiService.updateBook(editingBook.id, formData);
      setActionMessage({ type: "success", text: "Book updated successfully!" });
      setShowEditBookModal(false);
      setEditingBook(null);
      setEditImageFile(null);
      fetchBooks(currentPage);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: `Failed to update book: ${err.data?.message || err.message}`,
      });
    } finally {
      setIsSubmittingEditModal(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !loading
    ) {
      setCurrentPage(newPage);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", newPage.toString());
      setSearchParams(newSearchParams, { replace: true });
    }
  };

  if (loading && books.length === 0 && !error)
    return <Loader message="Loading books..." />;

  if (error && books.length === 0)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <p className="text-2xl font-semibold text-red-600 mb-2">
          Failed to Load Books
        </p>
        <p className="text-slate-600 mb-8">{error}</p>
        <button
          type="button"
          onClick={() => fetchBooks(currentPage)}
          className={`${primaryButtonClasses} text-sm`}
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center">
            <HiOutlineBookOpen className="h-10 w-10 text-indigo-600 mr-3 hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Manage Books
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewBook({
                name: "",
                price: "",
                description: "",
                imageUrl: "",
              });
              setAddImageFile(null);
              setActionMessage({ type: "", text: "" });
              setShowAddBookModal(true);
            }}
            className={`${primaryButtonClasses} mt-4 sm:mt-0 w-full sm:w-auto`}
          >
            <HiOutlinePlusCircle className="h-5 w-5 mr-2" />
            Add New Book
          </button>
        </div>

        {actionMessage.text && (
          <div
            className={`p-3.5 mb-6 rounded-md text-sm flex items-center space-x-2 ${
              actionMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
            role="alert"
          >
            {actionMessage.type === "success" ? (
              <HiOutlineCheckCircle className="h-5 w-5" />
            ) : (
              <HiOutlineExclamationCircle className="h-5 w-5" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {showAddBookModal && (
          <div className="fixed inset-0 bg-slate-800/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out_alt scale-95 animate-slideUpModal">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <HiOutlinePlusCircle className="h-7 w-7 mr-2 text-indigo-600" />{" "}
                  Add New Book
                </h2>
                <button
                  onClick={() => setShowAddBookModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <HiOutlineXCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleAddBookSubmit} className="space-y-4">
                <div>
                  <label htmlFor="add-name" className={inputLabelClasses}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="add-name"
                    value={newBook.name}
                    onChange={handleNewBookChange}
                    required
                    className={textInputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="add-price" className={inputLabelClasses}>
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="add-price"
                    value={newBook.price}
                    onChange={handleNewBookChange}
                    required
                    min="0.01"
                    step="0.01"
                    className={textInputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-description"
                    className={inputLabelClasses}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="add-description"
                    value={newBook.description}
                    onChange={handleNewBookChange}
                    required
                    rows="3"
                    className={textInputClasses}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="addImageFile"
                    className={`${inputLabelClasses} flex items-center`}
                  >
                    <HiOutlinePhotograph className="mr-1.5 h-4 w-4 text-slate-500" />{" "}
                    Book Cover Image File
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    id="addImageFile"
                    accept="image/*"
                    onChange={handleAddImageFileChange}
                    className={fileInputClasses}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Max 2MB. PNG, JPG, WEBP accepted.
                  </p>
                </div>
                <div>
                  <label htmlFor="add-imageUrl" className={inputLabelClasses}>
                    Or Image URL (if not uploading file)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="add-imageUrl"
                    value={
                      newBook.imageUrl.startsWith("data:")
                        ? ""
                        : newBook.imageUrl
                    }
                    onChange={handleNewBookChange}
                    className={textInputClasses}
                    disabled={!!addImageFile}
                    placeholder="https://example.com/image.jpg"
                  />
                  {newBook.imageUrl &&
                    newBook.imageUrl.startsWith("data:") &&
                    addImageFile && (
                      <div className="mt-3 border border-slate-200 rounded-md p-2 inline-block">
                        <img
                          src={newBook.imageUrl}
                          alt="Preview"
                          className="h-24 w-auto rounded"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-center">
                          {addImageFile.name}
                        </p>
                      </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddBookModal(false)}
                    className={`${secondaryButtonClasses}`}
                    disabled={isSubmittingAddModal}
                  >
                    {" "}
                    Cancel{" "}
                  </button>
                  <button
                    type="submit"
                    className={`${primaryButtonClasses}`}
                    disabled={isSubmittingAddModal}
                  >
                    {isSubmittingAddModal && <HiOutlinePencil />}
                    {isSubmittingAddModal ? "Adding..." : "Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditBookModal && editingBook && (
          <div className="fixed inset-0 bg-slate-800/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out_alt scale-95 animate-slideUpModal">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <HiPencilSquare className="h-7 w-7 mr-2 text-indigo-600" />{" "}
                  Edit Book
                </h2>
                <button
                  onClick={() => {
                    setShowEditBookModal(false);
                    setEditingBook(null);
                    setEditImageFile(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <HiOutlineXCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleEditBookSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className={inputLabelClasses}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    value={editBookFormState.name}
                    onChange={handleEditBookChange}
                    required
                    className={textInputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="edit-price" className={inputLabelClasses}>
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="edit-price"
                    value={editBookFormState.price}
                    onChange={handleEditBookChange}
                    required
                    min="0.01"
                    step="0.01"
                    className={textInputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-description"
                    className={inputLabelClasses}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="edit-description"
                    value={editBookFormState.description}
                    onChange={handleEditBookChange}
                    required
                    rows="3"
                    className={textInputClasses}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="editImageFile"
                    className={`${inputLabelClasses} flex items-center`}
                  >
                    <HiOutlinePhotograph className="mr-1.5 h-4 w-4 text-slate-500" />{" "}
                    Book Cover Image File (optional: replaces current)
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    id="editImageFile"
                    accept="image/*"
                    onChange={handleEditImageFileChange}
                    className={fileInputClasses}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Max 2MB. PNG, JPG, WEBP accepted.
                  </p>
                </div>
                <div>
                  <label htmlFor="edit-imageUrl" className={inputLabelClasses}>
                    Or Image URL (leave blank to keep current if no file
                    uploaded)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="edit-imageUrl"
                    value={
                      editBookFormState.imageUrl.startsWith("data:")
                        ? ""
                        : editBookFormState.imageUrl
                    }
                    onChange={handleEditBookChange}
                    className={textInputClasses}
                    disabled={!!editImageFile}
                    placeholder="https://example.com/image.jpg"
                  />
                  {editBookFormState.imageUrl &&
                    editImageFile &&
                    editBookFormState.imageUrl.startsWith("data:") && (
                      <div className="mt-3 border border-slate-200 rounded-md p-2 inline-block">
                        <img
                          src={editBookFormState.imageUrl}
                          alt="New preview"
                          className="h-24 w-auto rounded"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-center">
                          {editImageFile.name}
                        </p>
                      </div>
                    )}
                  {!editImageFile &&
                    editingBook?.imageUrl &&
                    !editBookFormState.imageUrl.startsWith("data:") && (
                      <div className="mt-3 border border-slate-200 rounded-md p-2 inline-block">
                        <img
                          src={editingBook.imageUrl}
                          alt="Current"
                          className="h-24 w-auto rounded"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-center">
                          Current Image
                        </p>
                      </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditBookModal(false);
                      setEditingBook(null);
                      setEditImageFile(null);
                    }}
                    className={`${secondaryButtonClasses}`}
                    disabled={isSubmittingEditModal}
                  >
                    {" "}
                    Cancel{" "}
                  </button>
                  <button
                    type="submit"
                    className={`${primaryButtonClasses}`}
                    disabled={isSubmittingEditModal}
                  >
                    {isSubmittingEditModal && <HiOutlineTrash />}
                    {isSubmittingEditModal ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {books.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <HiOutlineBookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-700">
              No Books Found
            </p>
            <p className="text-slate-500 mt-1">
              It looks like there are no books in the system yet. Try adding
              some!
            </p>
          </div>
        )}

        {books.length > 0 && (
          <div className="overflow-x-auto mt-6 rounded-lg shadow-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <img
                        src={book.imageUrl}
                        alt={book.name}
                        className="h-16 w-12 rounded object-cover shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">
                      {book.name}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      {" "}
                      <button
                        onClick={() => openEditModal(book)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold p-1.5 hover:bg-indigo-50 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 flex items-center transition-colors"
                      >
                        <HiPencilSquare className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold p-1.5 hover:bg-red-50 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 flex items-center transition-colors"
                      >
                        <HiOutlineTrash className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-1.5 mt-8 sm:mt-10">
            {" "}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`${baseButtonClasses} ${sizeSmClasses} ${paginationButtonDefaultClasses}`}
            >
              &larr; Previous
            </button>
            {[...Array(totalPages).keys()].map((num) => {
              const pageNum = num + 1;
              const showButton =
                totalPages <= 7 ||
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
              const isEllipsis =
                totalPages > 7 &&
                ((pageNum === currentPage - 2 && pageNum > 1) ||
                  (pageNum === currentPage + 2 && pageNum < totalPages));

              if (isEllipsis) {
                return (
                  <span
                    key={`ellipsis-${pageNum}`}
                    className="px-2 py-1.5 text-xs text-slate-500"
                  >
                    ...
                  </span>
                );
              }
              if (showButton) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading || currentPage === pageNum}
                    className={`${baseButtonClasses} ${sizeSmClasses} ${
                      currentPage === pageNum
                        ? paginationButtonActiveClasses
                        : paginationButtonDefaultClasses
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`${baseButtonClasses} ${sizeSmClasses} ${paginationButtonDefaultClasses}`}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooksPage;
