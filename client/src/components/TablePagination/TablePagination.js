import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { range as _range } from 'lodash';

const TablePagination = ({ pages, page, limit, fetchContent, sort, order }) => {

  const onPageSelect = (page) => {
    fetchContent({ page, limit, sort, order });
  };

  const maxPagesShown = 10;

  let pageNosToShow;
  if (pages <= maxPagesShown) pageNosToShow = _range(pages);
  else {
    pageNosToShow = [0];
    const minOffset = page > pages - (maxPagesShown - 2) ? pages - maxPagesShown + 1 : Math.max(1, page - 2);
    const maxOffset = page < 4 ? maxPagesShown - 1 : Math.min(pages - 1, page + maxPagesShown - 4);
    pageNosToShow.push(..._range(minOffset, maxOffset));
    pageNosToShow.push(pages - 1);
  }

  const items = pageNosToShow.map((pageNo) =>
    <PaginationItem
      key={pageNo + 1}
      onClick={(e) => {e.preventDefault(); onPageSelect(pageNo + 1);}}
      active={(pageNo + 1) === page}
    >
      <PaginationLink href="#">{pageNo + 1}</PaginationLink>
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
  sort: PropTypes.string,
  order: PropTypes.oneOf(['asc', 'desc']),
};

export default TablePagination;
