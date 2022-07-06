import rdf from 'rdf-ext'
import namespace from '@rdfjs/namespace'
const ns = {
  time: namespace('http://www.w3.org/2006/time#'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

const { namedNode, quad: _quad, literal } = rdf

const supportedDateFormats = [
  'dd.mm.yyyy',
  'mm.yyyy',
  'yyyy',
  'yy. Jh.',
  'dd.mm.yyyy v. Chr.',
  'mm.yyyy v. Chr.',
  'yyyy v. Chr.',
  'yy. Jh. v. Chr.'
]

const bcTag = 'v. Chr.'
const approxTag = '(ca.)'
const allowedMissingValues = ['', 'keine angabe', 's. d. (sine dato)', 's.d. (sine dato)', 'k.a.', 's.d.']

const DDMMYYYY = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(\d{4})\s*$/
const YYYYMMDD = /^\s*(\d{4})\.(1[012]|0?[1-9])\.(3[01]|[12][0-9]|0?[1-9])\s*$/
const MMYYYY = /^\s*(1[012]|0?[1-9])\.(\d{4})\s*$/
const YYYYMM = /^\s*(\d{4})\.(1[012]|0?[1-9])\s*$/
const YYYY = /^\s*(\d{4})\s*$/
const YY = /^\s*(\d{2}).(Jh.)\s*$/
const isoDatetimePattern = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/

const LONG_MONTHS = [1, 3, 5, 7, 8, 10, 12]
const SHORT_MONTHS = [4, 6, 9, 11]

const isLeapYear = (year) => {
  if (year > 1582) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
  } else {
    return (year % 4 === 0)
  }
}

export const validateDate = (day, month, year, isBc) => {
  if (isBc) {
    year = (-1) * year
  }

  let isValidDate = true
  if ((LONG_MONTHS.includes(month)) && (day > 31)) {
    isValidDate = false
  }
  if ((SHORT_MONTHS.includes(month)) && (day > 30)) {
    isValidDate = false
  }
  if (month === 2) {
    const isLeapYearValue = isLeapYear(year)
    if (isLeapYearValue && day > 29) {
      isValidDate = false
    }
    if (!isLeapYearValue && day > 28) {
      isValidDate = false
    }
  }

  if (!isValidDate) {
    throw Error('This date does not exist')
  }
}

export const archScopeToEtdfDate = (date) => {
  // Transform ArchSope date to ISO_8601 or EDTF date format
  let isBc = false
  if (date.includes(bcTag)) {
    date = date.replace(bcTag, '')
    isBc = true
  }
  let isApproximate = false
  if (date.includes(approxTag)) {
    date = date.replace(approxTag, '')
    isApproximate = true
  }
  date = date.replace(' ', '')

  let dateElements, year, month, day
  if (DDMMYYYY.test(date)) {
    dateElements = DDMMYYYY.exec(date)
    day = dateElements[1]
    month = dateElements[2]
    year = dateElements[3]
  } else if (YYYYMMDD.test(date)) {
    dateElements = YYYYMMDD.exec(date)
    day = dateElements[3]
    month = dateElements[2]
    year = dateElements[1]
  } else if (MMYYYY.test(date)) {
    dateElements = MMYYYY.exec(date)
    month = dateElements[1]
    year = dateElements[2]
  } else if (YYYYMM.exec(date)) {
    dateElements = YYYYMM.exec(date)
    month = dateElements[2]
    year = dateElements[1]
  } else if (YYYY.test(date)) {
    dateElements = YYYY.exec(date)
    year = dateElements[1]
  } else if (YY.test(date)) {
    dateElements = YY.exec(date)
    year = dateElements[1] + 'xx'
  } else {
    throw Error(`This date format is not supported. Try one of: \n -${supportedDateFormats.join('\n -')}`)
  }

  if (typeof day !== 'undefined') {
    validateDate(Number(day), Number(month), Number(year), isBc)
  }

  if (month != null) {
    month = String(Number(month)).padStart(2, '0')
  }
  // ISO format includes 0 year: 10 BC => -9
  if (isBc) {
    if (!YY.test(date)) {
      year = String(Number(year) - 1).padStart(4, '0')
    }
    year = '-' + year
  }

  let edtfDate = [year, month, day].filter(Boolean).join('-')
  if (isApproximate) {
    edtfDate += '~'
  }
  return edtfDate
}

export const etdfToIsoDate = (date, isBeginning) => {
  const hasUncertanity = date.charAt(date.length - 1) === '~'
  if (hasUncertanity) {
    date = date.substring(0, date.length - 1)
  }

  const dateElements = date.split('-')
  let year = parseInt(dateElements[0])
  const hasDefinedMonth = dateElements.length >= 2
  const hasDefinedDay = dateElements.length === 3

  let month, day
  if (hasDefinedMonth) {
    month = parseInt(dateElements[1])
  } else {
    if (isBeginning) {
      month = 1
    } else {
      month = 12
    }
  }

  if (hasDefinedDay) {
    day = parseInt(dateElements[2])
  } else {
    if (isBeginning) {
      day = 1
    } else {
      if (LONG_MONTHS.includes(month)) {
        day = 31
      } else if (SHORT_MONTHS.includes(month)) {
        day = 30
      } else if (month === 2) {
        if (isLeapYear(year)) {
          day = 29
        } else {
          day = 28
        }
      } else {
        throw new Error('Months can only take 1-12 values')
      }
    }
  }

  year = ('' + year).padStart(4, '0')
  month = ('' + month).padStart(2, '0')
  day = ('' + day).padStart(2, '0')

  let time
  if (isBeginning) {
    time = 'T00:00:00'
  } else {
    time = 'T23:59:59'
  }

  return [year, month, day].join('-') + time
}

const isIsoDateTime = (date) => {
  return isoDatetimePattern.test(date)
}

const createTimeRangeQuads = (startDate, endDate, subject) => {
  const from = etdfToIsoDate(startDate, true)
  const to = etdfToIsoDate(endDate, false)

  if (!isIsoDateTime(from)) {
    throw new Error(`${from} is not valid ISO date`)
  }

  if (!isIsoDateTime(to)) {
    throw new Error(`${from} is not valid ISO date`)
  }

  const splitted = subject.value.split('/')
  const record = namedNode(splitted.slice(0, splitted.length - 1).join('/'))
  const timeBegins = namedNode(record + '#timeBegins')
  const timeEnds = namedNode(record + '#timeEnds')

  const quads = [
    _quad(record, ns.rdf.type, ns.time.Interval),
    _quad(record, ns.time.hasBeginning, timeBegins),
    _quad(record, ns.time.hasEnd, timeEnds),
    _quad(timeBegins, ns.rdf.type, ns.time.Instant),
    _quad(timeBegins, ns.time.inXSDDate, literal(from, ns.xsd.dateTime)),
    _quad(timeEnds, ns.rdf.type, ns.time.Instant),
    _quad(timeEnds, ns.time.inXSDDate, literal(to, ns.xsd.dateTime))
  ]
  return quads
}

export const transformDates = (quad) => {
  const dates = quad.object.value.split('-')
  if (dates.length > 2) {
    throw new Error(`Invalid date range ${dates}`)
  }
  const etdfDates = dates.reduce(function (res, x) {
    if (!allowedMissingValues.includes(x.toLowerCase())) {
      res.push(x)
    }
    return res
  }, [])

  if (etdfDates.length === 0) {
    return [quad]
  }

  let quads = []
  if (etdfDates.length === 1) {
    quad.object.value = etdfDates[0]
    quads = createTimeRangeQuads(etdfDates[0], etdfDates[0], quad.subject)
  } else {
    quad.object.value = etdfDates.join('-')
    quads = createTimeRangeQuads(etdfDates[0], etdfDates[1], quad.subject)
  }
  quads.push(_quad(quad.subject, quad.predicate, quad.object))

  return quads
}
