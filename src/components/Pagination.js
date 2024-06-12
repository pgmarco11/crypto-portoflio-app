const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
  
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="pagination">
        <button
          className={`page-button ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <ul className="page-numbers">
          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-number ${currentPage === number ? 'active' : ''}`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </li>
          ))}
        </ul>
        <button
          className={`page-button ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
  
  export default Pagination;
  