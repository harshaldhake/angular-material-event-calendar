angular
  .module('material.components.eventCalendar')
  .factory('$$mdEventCalendarBuilder', mdEventCalendarBuilderService);


var nextId = 0;

/**
 * @ngdoc service
 * @name $$mdEventCalendarBuilder
 * @module material.components.eventCalendar
 **/
 /*@ngInject*/
function mdEventCalendarBuilderService($$mdEventCalendarUtil, $templateCache) {
  var service = {
    month: month,
    showMore: showMore
  };
  return service;



  function showMore(opts) {
    var date = opts.date;
    var selected = opts.selected  || [];
    var events = opts.events ? filterEventsOnDay(date, opts.events) : [];
    var labelProperty = opts.labelProperty;
    var showMoreBody = document.createDocumentFragment();
    var container = document.createElement('div');
    container.classList.add('md-event-calendar-show-more-container');
    var content = document.createElement('div');
    content.classList.add('md-event-calendar-show-more-content');
    var dateLabel = document.createElement('div');
    dateLabel.classList.add('md-event-calendar-show-more-date-label');
    dateLabel.textContent = $$mdEventCalendarUtil.dates[date.getDate()];
    var closeButton = document.createElement('div');
    closeButton.classList.add('md-event-calendar-show-more-close');
    closeButton.innerHTML = $templateCache.get('icons/ic_close_black_24px.svg');
    closeButton.setAttribute('md-show-more-close', 'true');
    container.appendChild(dateLabel);
    container.appendChild(closeButton);
    container.appendChild(content);
    showMoreBody.appendChild(container);

    events.forEach(function (item) {
      var eventElement;
      var isStartThisDay = $$mdEventCalendarUtil.isSameDay(date, item.start);
      var isEndThisDay = $$mdEventCalendarUtil.isValidDate(item.end) ? $$mdEventCalendarUtil.isSameDay(date, item.end) : true;
      var eventOptions = {
        labelProperty: labelProperty,
        selected: selected
      };

      if (isStartThisDay && isEndThisDay) {
        eventElement = createEventElement({className: 'single', hasLabel: true}, item, eventOptions);
      } else if (isStartThisDay) {
        eventElement = createEventElement({className: 'start-right', hasLabel: true}, item, eventOptions);
      } else if (isEndThisDay) {
        eventElement = createEventElement({className: 'end-left', hasLabel: true}, item, eventOptions);
      } else {
        eventElement = createEventElement({className: 'continue', hasLabel: true}, item, eventOptions);
      }

      content.appendChild(eventElement);
    });

    return showMoreBody;
  }


  function filterEventsOnDay(date, events) {
    return !events || !events.length ? [] : events.filter(function (item) {
      return $$mdEventCalendarUtil.isDateWithinRange(date, item.start, item.end || item.start);
    }).sort(function(a, b) {
      a = new Date(a.start);
      b = new Date(b.start);
      return a > b ? 1 : a < b ? -1 : 0;
    });
  }












  function month(options) {
    var calendarStartDate;
    var today = $$mdEventCalendarUtil.createDateAtMidnight();
    var date = $$mdEventCalendarUtil.isValidDate(options.date) ? options.date : new Date();
    var labelProperty = options.labelProperty;
    var firstDayOfMonth = $$mdEventCalendarUtil.getFirstDateOfMonth(date);
    var firstDayOfTheWeek = (firstDayOfMonth.getDay() + 7) % 7;
    var numberOfDaysInMonth = $$mdEventCalendarUtil.getNumberOfDaysInMonth(date);
    var events = filterCurrentCalendar(date, options.events);
    events.forEach(cleanEvent);
    var selected = options.selected  || [];
    var rowNumber = 1;
    var monthElement = createMonthElement();
    var row = createRowElement();
    monthElement.appendChild(row);
    var firstCalendarDay = true;
    var cellSize = (options.bounds.width / 7) - 48;
    var maxEvents = Math.floor(cellSize / 24);
    var d = 0;



    // days from last month
    if (firstDayOfTheWeek > 0) {
      calendarStartDate = $$mdEventCalendarUtil.getFirstDateOfMonth(date);
      calendarStartDate.setDate(calendarStartDate.getDate() - firstDayOfTheWeek);
      while (d < firstDayOfTheWeek) {
        row.appendChild(createCellElement({
          date: calendarStartDate,
          today: today,
          dayOfWeek: d,
          differentMonth: true,
          events: events,
          isFirstDay: firstCalendarDay,
          isLastDay: false,
          maxEvents: maxEvents,
          selected: selected
        }));
        firstCalendarDay = false;
        d += 1;
        calendarStartDate.setDate(calendarStartDate.getDate() + 1);
      }
    }



    // Add a cell for each day of the month, keeping track of the day of the week so that
    // we know when to start a new row.
    var dayOfWeek = firstDayOfTheWeek;
    var iterationDate = firstDayOfMonth;
    var lastCalendarDay = false;
    d = 1;
    while (d <= numberOfDaysInMonth) {
      // If we've reached the end of the week, start a new row.
      if (dayOfWeek === 7) {
        dayOfWeek = 0;
        row = createRowElement();
        firstCalendarDay = false;
        monthElement.appendChild(row);
      }

      if (dayOfWeek === 6 && d === numberOfDaysInMonth) {
        lastCalendarDay = true;
      }

      iterationDate.setDate(d);
      row.appendChild(createCellElement({
        date: iterationDate,
        today: today,
        dayOfWeek: dayOfWeek,
        events: events,
        isFirstDay: firstCalendarDay,
        isLastDay: lastCalendarDay,
        maxEvents: maxEvents,
        selected: selected
      }));
      firstCalendarDay = false;
      dayOfWeek += 1;
      d += 1;
    }



    // fill in the rest of the row with next month
    while (row.childNodes.length < 7) {
      if (dayOfWeek === 6) {
        lastCalendarDay = true;
      }
      iterationDate.setDate(d);
      row.appendChild(createCellElement({
        date: iterationDate,
        today: today,
        dayOfWeek: dayOfWeek,
        differentMonth: true,
        events: events,
        isFirstDay: false,
        isLastDay: lastCalendarDay,
        maxEvents: maxEvents,
        selected: selected
      }));
      dayOfWeek += 1;
      d += 1;
    }


    return monthElement;
  }



  function createCellElement(options) {
    var cell = document.createElement('div');
    cell.classList.add('md-event-calendar-month-cell');
    if (options.differentMonth === true) { cell.classList.add('different-month'); }
    if ($$mdEventCalendarUtil.isSameDay(options.date, options.today)) { cell.classList.add('today'); }

    var cellSpacer = document.createElement('div');
    cellSpacer.classList.add('md-event-calendar-month-cell-spacer');
    cell.appendChild(cellSpacer);

    var divider = document.createElement('div');
    divider.classList.add('md-event-calendar-month-cell-divider');
    cell.appendChild(divider);

    var cellContent = document.createElement('div');
    cellContent.classList.add('md-event-calendar-month-cell-content');
    cell.appendChild(cellContent);

    var dateLabel = document.createElement('div');
    dateLabel.classList.add('md-event-calendar-cell-data-label');
    dateLabel.textContent = $$mdEventCalendarUtil.dates[options.date.getDate()];
    cellContent.appendChild(dateLabel);

    createEventElements(cellContent, options);

    return cell;
  }



  function createEventElements(cellContent, options) {
    var i;
    var place = 0;
    var hasEvents = false;
    var matchingEvents = getEventsInRange(options.date, options.events);
    matchingEvents = setEventPlaces(matchingEvents);
    matchingEvents.every(function (eventItem, pos) {
      var type = getEventDisplayType(eventItem, options);
      var placeDiff = eventItem.$$place - place;
      hasEvents = true;
      place = eventItem.$$place + 1;
      i = 0;
      // add spacer items for overflow events from last day
      while (i < placeDiff) {
        if (place >= options.maxEvents) {
          cellContent.appendChild(createShowMore(matchingEvents.length - pos, options.date));
          return false;
        }
        cellContent.appendChild(createEventSpacerElement());
        i += 1;
      }

      if (place >= options.maxEvents) {
        cellContent.appendChild(createShowMore(matchingEvents.length - pos, options.date));
        return false;
      }
      cellContent.appendChild(createEventElement(type, eventItem, options));
      return true;
    });

    if (hasEvents === true) {
      cellContent.classList.add('md-has-events');
    }
  }


  function createShowMore(num, date) {
    var showMoreElement = document.createElement('div');
    showMoreElement.classList.add('md-event-calendar-cell-event-show-more-link');
    showMoreElement.textContent = num+' more';
    showMoreElement.setAttribute('md-show-more', date.toISOString());
    return showMoreElement;
  }


  function createEventSpacerElement() {
    var spacer = document.createElement('div');
    spacer.classList.add('md-event-calendar-cell-event-spacer');
    return spacer;
  }

  function createEventElement(type, eventItem, options) {
    var hash = getHashValue(eventItem);
    var eventElement = document.createElement('div');
    eventElement.classList.add('md-event-calendar-cell-event');
    eventElement.classList.add('md-'+type.className);
    eventElement.setAttribute('md-event-id', hash);

    if (type.hasLabel === true) {
      var dateLabelTime = document.createElement('span');
      dateLabelTime.classList.add('md-event-calendar-cell-event-time');
      dateLabelTime.textContent = $$mdEventCalendarUtil.formatEventTime(eventItem.start);
      eventElement.appendChild(dateLabelTime);

      var dateLabelText = document.createElement('span');
      dateLabelText.textContent = eventItem[options.labelProperty];
      eventElement.appendChild(dateLabelText);
    }

    options.selected.every(function (sel) {
      if (sel.$$mdEventId !== undefined && sel.$$mdEventId === eventItem.$$mdEventId) {
        eventElement.classList.add('md-selected');
        return false;
      }
      return true;
    });

    return eventElement;
  }



  function getHashValue(value) {
    if (angular.isObject(value)) {
      return 'object_' + (value.$$mdEventId || (value.$$mdEventId = ++nextId));
    }
    return 'id_' + (++nextId);
  }


  function getEventDisplayType(item, options) {
    var className;
    var hasLabel;

    var isStartThisDay = $$mdEventCalendarUtil.isSameDay(options.date, item.start);
    var isEndThisDay = $$mdEventCalendarUtil.isValidDate(item.end) ? $$mdEventCalendarUtil.isSameDay(options.date, item.end) : true;

    // single day event
    if (isStartThisDay && (options.allDay || isEndThisDay)) {
      className = 'single';
      hasLabel = true;

    // starts today
    } else if (isStartThisDay) {
      className = 'start';
      hasLabel = true;

    // ends on sunday
    } else if (isEndThisDay && options.dayOfWeek === 0) {
      className = 'end-left';
      hasLabel = true;

    // last day of event
    } else if (isEndThisDay) {
      className = 'end';
      hasLabel = options.isFirstDay; // add label if event is continuing from last month

    // continuation on sunday
    } else if (options.dayOfWeek === 0) {
      className = 'continue-left';
      hasLabel = true;

    // continue on sat
    } else if (options.dayOfWeek === 6) {
      className = 'continue-right';
      hasLabel = false;

    // continuation
    } else {
      className = 'continue';
      hasLabel = false;
    }

    return {
      className: className,
      hasLabel: hasLabel
    };
  }

  function getEventsInRange(date, events) {
    return events.filter(function (item) {
      return $$mdEventCalendarUtil.isDateWithinRange(date, item.start, item.end || item.start);
    });
  }

  function setEventPlaces(events) {
    var takenPlaces = [];
    events.forEach(function(item) {
      if (!item.$$place) {
        item.$$place = getPlace();
      } else {
        takenPlaces.push(item.$$place);
      }
    });

    return events.sort(function(a, b) {
      if (a.$$place > b.$$place) { return 1; }
      if (a.$$place < b.$$place) { return -1; }
      return 0;
    });

    function getPlace() {
      var place = takenPlaces.length > 0 ? takenPlaces[takenPlaces.length-1] + 1 : 0;
      takenPlaces.push(place);
      return place;
    }
  }


  function createMonthElement() {
    var monthBody = document.createDocumentFragment();
    var headerRow = document.createElement('div');
    headerRow.classList.add('md-event-calendar-month-row-header');
    monthBody.appendChild(headerRow);

    // add header day labels
    $$mdEventCalendarUtil.days.forEach(function (name) {
      var dayHeader = document.createElement('div');
      dayHeader.classList.add('md-event-calendar-month-cell-header');
      dayHeader.textContent = name.slice(0,3).toLowerCase();
      headerRow.appendChild(dayHeader);
    });

    return monthBody;
  }

  function createRowElement() {
    var row = document.createElement('div');
    row.classList.add("md-event-calendar-month-row");
    return row;
  }


  function filterCurrentCalendar(date, events) {
    if (!events || !events.length) { return []; }
    // back fill 6 days for posibility of last month days showing up
    var start = $$mdEventCalendarUtil.getFirstDateOfMonth(date).getDate(-6);
    // front fill 6 days for posibility of next month days showing up
    var end = $$mdEventCalendarUtil.getFirstDateOfMonth(date).getDate(37);

    return events.filter(function (item) {
      if (!$$mdEventCalendarUtil.isValidDate(item.start)) { return false; }
      if ($$mdEventCalendarUtil.isDateWithinRange(item.start, start, end)) { return true; }
      if (!$$mdEventCalendarUtil.isValidDate(item.end)) { return false; }
      if ($$mdEventCalendarUtil.isDateWithinRange(item.end, start, end)) { return true; }
      return false;
    }).sort(function(a, b) {
      a = new Date(a.start);
      b = new Date(b.start);
      return a > b ? 1 : a < b ? -1 : 0;
    });
  }


  function cleanEvent(item) {
    item.$$hide = undefined;
    item.$$place = undefined;
  }
}
