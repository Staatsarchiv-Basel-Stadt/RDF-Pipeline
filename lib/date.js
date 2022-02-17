const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')
const ns = {
  time: namespace('http://www.w3.org/2006/time#'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

const supported_date_formats = [
    "dd.mm.yyyy",
    "mm.yyyy",
    "yyyy",
    "yy. Jh.",
    "dd.mm.yyyy v. Chr.",
    "mm.yyyy v. Chr.",
    "yyyy v. Chr.",
    "yy. Jh. v. Chr."
]

const bc_tag = "v. Chr."
const approx_tag = "(ca.)"
const allowed_missing_values = ["", "keine angabe", "s. d. (sine dato)", "s.d. (sine dato)", "k.a.", "s.d."]

const DDMMYYYY = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.(\d{4})\s*$/;
const YYYYMMDD = /^\s*(\d{4})\.(1[012]|0?[1-9])\.(3[01]|[12][0-9]|0?[1-9])\s*$/;
const MMYYYY = /^\s*(1[012]|0?[1-9])\.(\d{4})\s*$/;
const YYYYMM = /^\s*(\d{4})\.(1[012]|0?[1-9])\s*$/;
const YYYY = /^\s*(\d{4})\s*$/;
const YY = /^\s*(\d{2}).(Jh.)\s*$/;
const iso_day_pattern = /^\s*(\d{4})\-(1[012]|0?[1-9])\-(3[01]|[12][0-9]|0?[1-9])\s*$/;
const iso_datetime_pattern = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/

const LONG_MONTHS = [1, 3, 5, 7, 8, 10, 12]
const SHORT_MONTHS = [4, 6, 9, 11]

function isLeapYear(year){
    if (year > 1582) {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    } else {
        return (year % 4 == 0)
    }
}

function validateDate(day, month, year, is_bc) {

    if (is_bc) {
        year = (-1) * year
    }

    let is_valid_date = true
    if ((LONG_MONTHS.includes(month)) && (day > 31)) {
        is_valid_date = false
    }
    if ((SHORT_MONTHS.includes(month)) && (day > 30)) {
        is_valid_date = false
    }
    if (month == 2) {

        const is_leap_year = isLeapYear(year)
        if (is_leap_year && day > 29) {
            is_valid_date = false
        }
        if (!is_leap_year && day > 28) {
            is_valid_date = false
        }
    }

    if (!is_valid_date) {
        throw Error("This date does not exist")
    }
}

function archScopeToEtdfDate(date) {
    //Transform ArchSope date to ISO_8601 or EDTF date format

    let is_bc = false
    if (date.includes(bc_tag)) {
        date = date.replace(bc_tag, "")
        is_bc = true
    }
    let is_approximate = false
    if (date.includes(approx_tag)){
        date = date.replace(approx_tag, "")
        is_approximate = true
    }
    date = date.replace(" ", "")

    let date_elements, year, month, day
    if (DDMMYYYY.test(date)) {
        date_elements = DDMMYYYY.exec(date);
        day = date_elements[1]
        month = date_elements[2]
        year = date_elements[3]

    } else if (YYYYMMDD.test(date)) {
        date_elements = YYYYMMDD.exec(date);
        day = date_elements[3]
        month = date_elements[2]
        year = date_elements[1]
    } else if (MMYYYY.test(date)) {

        date_elements = MMYYYY.exec(date);
        month = date_elements[1]
        year = date_elements[2]

    } else if(YYYYMM.exec(date)){
        date_elements = YYYYMM.exec(date);
        month = date_elements[2]
        year = date_elements[1]

    } else if (YYYY.test(date)) {

        date_elements = YYYY.exec(date);
        year = date_elements[1]

    } else if (YY.test(date)) {
        date_elements = YY.exec(date);
        year = date_elements[1] + "xx"
    } else {
        throw Error(`This date format is not supported. Try one of: \n -${supported_date_formats.join("\n -")}`)
    }

    if (typeof day !== 'undefined'){
        validateDate(Number(day), Number(month), Number(year), is_bc)
    }

    if (month != null){
        month = String(Number(month)).padStart(2, '0')
    }
    // ISO format includes 0 year: 10 BC => -9
    if (is_bc) {
        if (!YY.test(date)){
            year = String(Number(year) - 1).padStart(4, '0')
        }
        year = "-" + year
    }

    let edtf_date = [year, month, day].filter(Boolean).join("-")
    if (is_approximate){
        edtf_date += "~"
    }
    return edtf_date
}

function etdfToIsoDate(date, is_beginning) {

   const has_uncertanity = date.charAt(date.length-1) === "~"
   if (has_uncertanity) {
       date = date.substring(0, date.length-1)
   }

   date_elements = date.split("-")
   let year = parseInt(date_elements[0])
   const has_defined_month = date_elements.length >= 2
   const has_defined_day = date_elements.length === 3

   let month, day
   if (has_defined_month){
        month = parseInt(date_elements[1])
   } else {
       if (is_beginning){
           month = 1
       } else {
           month = 12
       }
   }

   if (has_defined_day){
        day = parseInt(date_elements[2])
   } else {
       if (is_beginning){
           day = 1
       } else {
           if (LONG_MONTHS.includes(month)){
               day = 31
           } else if (SHORT_MONTHS.includes(month)){
               day = 30
           } else if (month == 2){
               if(isLeapYear(year)){
                   day = 29
               } else {
                   day = 28
               }
           } else {
               throw("Months can only take 1-12 values")
           }
       }
   }

   year = ("" + year).padStart(4, '0')
   month = ("" + month).padStart(2, '0')
   day = ("" + day).padStart(2, '0')

   let time
   if (is_beginning) {
       time = "T00:00:00"
   } else {
       time = "T23:59:59"
   }

   return [year, month, day].join("-") + time
}

function isIsoDateTime(date){

    return iso_datetime_pattern.test(date)

}

function createTimeRangeQuads(start_date, end_date, subject){

    const from = etdfToIsoDate(start_date, true)
    const to = etdfToIsoDate(end_date, false)

    if (!isIsoDateTime(from)){
        throw(`${from} is not valid ISO date`)
    }

    if (!isIsoDateTime(to)){
        throw(`${from} is not valid ISO date`)
    }

    const splitted = subject.value.split("/")
    const record = rdf.namedNode(splitted.slice(0,splitted.length-1).join("/"))
    const timeBegins = rdf.namedNode(record+"#timeBegins")
    const timeEnds = rdf.namedNode(record+"#timeEnds")

    quads = [
        rdf.quad(record, ns.rdf.type, ns.time.Interval),
        rdf.quad(record, ns.time.hasBeginning, timeBegins),
        rdf.quad(record, ns.time.hasEnd, timeEnds),
        rdf.quad(timeBegins, ns.rdf.type, ns.time.Instant),
        rdf.quad(timeBegins, ns.time.inXSDDate, rdf.literal(from, ns.xsd.dateTime)),
        rdf.quad(timeEnds, ns.rdf.type, ns.time.Instant),
        rdf.quad(timeEnds, ns.time.inXSDDate, rdf.literal(to, ns.xsd.dateTime))
    ]
    return quads
}

function transformDates(quad){

    const dates = quad.object.value.split("-")
    if (dates.length > 2){
            throw `Invalid date range ${dates}`
    }
    const etdf_dates = dates.reduce(function(res, x) {
            if (!allowed_missing_values.includes(x.toLowerCase())) {
               res.push(x);
            }
            return res;
    }, []);

    if (etdf_dates.length === 0){
            return [quad]
    }

    if (etdf_dates.length === 1){
        quad.object.value = etdf_dates[0]
        quads = createTimeRangeQuads(etdf_dates[0], etdf_dates[0], quad.subject)
    } else {
        quad.object.value = etdf_dates.join("-")
        quads = createTimeRangeQuads(etdf_dates[0], etdf_dates[1], quad.subject)
    }
    quads.push(rdf.quad(quad.subject, quad.predicate, quad.object))

    return quads
}

module.exports = {
    archScopeToEtdfDate,
    validateDate,
    etdfToIsoDate,
    transformDates
}