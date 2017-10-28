import React from 'react';
import Timeago from 'timeago.js';

export const Human = ({ date, }) => {
  const text = getText(date, inHumanFormat);
  return (
    <span className='display-date display-date--human'>{text}</span>
  );
};

export const Ago = ({ date, }) => {
  const text = getText(date, inAgoFormat);
  return (
    <span className='display-date display-date--ago'>{text}</span>
  );
};

function inHumanFormat(d) {
  const locale = navigator.language || navigator.userLanguage;
  return d.toLocaleString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
}

function inAgoFormat(d) {
  const timeago = Timeago();
  return timeago.format(d);
}

function getText(d, transform) {
  const date = d ? new Date(d) : new Date(NaN);
  return isNaN(date.getTime()) ? '' : transform(date);
}

