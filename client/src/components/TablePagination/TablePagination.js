import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const TablePagination = ({ pages, page, limit, fetchContent }) => {

  const onPageSelect = (page) => {
    fetchContent({ page, limit });
  };

  const items = Array(pages).fill().map((_, i) =>
    <PaginationItem
      key={i}
      onClick={(e) => {e.preventDefault(); onPageSelect(i + 1);}}
      active={i + 1 === page}
    >
      <PaginationLink href="#">{i + 1}</PaginationLink>
    </PaginationItem>
  );

  const pagination = () =>
    <div className='text-center'>
      <Pagination className='table-pagination'>{items}</Pagination>
    </div>
  ;

  const noPagination = () =>
    <div className='text-center invisible'>
      <Pagination className='table-pagination'>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
      </Pagination>
    </div>
  ;

  return pages > 1 ? pagination() : noPagination();
};

TablePagination.propTypes = {
  pages: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  fetchContent: PropTypes.func.isRequired,
};

export default TablePagination;
