import React from 'react';
import { Pagination } from 'react-bootstrap';

const TablePagination = ({ pages, currentPage, limit, fetchContent }) => {

  const onPageSelect = (page) => {
    fetchContent({ page, limit });
  };

  const items = Array(pages).fill().map((_, i) =>
    <Pagination.Item
      key={i}
      onClick={() => onPageSelect(i + 1)}
      active={i + 1 === currentPage}>
      {i + 1}
    </Pagination.Item>
  );

  const pagination = () =>
    <div className='text-center'>
      <Pagination className='table-pagination'>{items}</Pagination>
    </div>
  ;

  const noPagination = () =>
    <div className='text-center invisible'>
      <Pagination className='table-pagination'>
        <Pagination.Item>1</Pagination.Item>
      </Pagination>
    </div>
  ;

  return pages > 1 ? pagination() : noPagination();
};

export default TablePagination;
