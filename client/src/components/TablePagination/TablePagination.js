import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { range as _range } from 'lodash';

const TablePagination = ({ pages, page, limit, fetchContent, sort, order }) => {

  const onPageSelect = (page) => {
    fetchContent({ page, limit, sort, order });
  };

  const maxPagesShown = 10; // Total pages to show
  const leftNeighbour = 2; // How many localised pages left of the current page to show: 1 _4_ [5] 6 ...
  const fixedStart = 2; // How many forced starting pages to show: _1 2_ 6 [7] 8 9 ...
  const fixedEnd = 2; // How many forced end pages to show: ... [7] 8 9 10 _30_

  let pageNosToShow;
  if (pages <= maxPagesShown) pageNosToShow = _range(pages);
  else {
    pageNosToShow = [..._range(fixedStart)]; // Seed the fixed starters

    const minOffset = page > pages - (maxPagesShown - (fixedStart + leftNeighbour)) ?
        pages - (maxPagesShown - fixedStart) // Page plus right neighbours include final page
      : Math.max(fixedStart, page - leftNeighbour - 1);
    const maxOffset = page < (fixedStart + leftNeighbour + 1) ?
        maxPagesShown - fixedEnd // Page and left neightbours are sequential
      : Math.min(pages - fixedEnd, page + maxPagesShown - (fixedStart + leftNeighbour + fixedEnd + 1));
    pageNosToShow.push(..._range(minOffset, maxOffset));

    pageNosToShow.push(..._range(pages - fixedEnd, pages)); // Add final page(s) always
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
