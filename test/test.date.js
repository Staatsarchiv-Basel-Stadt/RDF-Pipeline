import { describe, it } from 'mocha'
import { expect } from 'chai'
import { validateDate, archScopeToEtdfDate, etdfToIsoDate } from '../lib/date.js'
import { strictEqual } from 'assert'

describe('validateDate', () => {
  it('should produce an error for invalid dates', () => {
    const inputs = [
      [32, 1, 1990], // day>31 in 31-day month
      [31, 4, 89], // day>30 in 30-day month
      [30, 2, 1756], // day>29 in february
      [29, 2, 1401], // day>28 in february in non-leap year (before 1582)
      [30, 2, 1400], // day>29 in february in leap year (before 1582)
      [29, 2, 1800], // day>28 in february in non-leap year (after 1582)
      [29, 2, 1802], // day>28 in february in non-leap year (after 1582)
      [30, 2, 1600], // day>29 in february in leap year (after 1582)
      [30, 2, 1904] // day>29 in february in leap year (after 1582)
    ]
    for (const input of inputs) {
      expect(() => validateDate(...input, false)).to.throw('This date does not exist')
    }
  })

  it('should produce no error for valid dates', () => {
    const inputs = [
      [31, 1, 1990], // day<=31 in 31-day month
      [30, 4, 89], // day<=30 in 30-day month
      [29, 2, 1756], // day<=29 in february
      [28, 2, 1401], // day<=28 in february in non-leap year (before 1582)
      [29, 2, 1400], // day<=29 in february in leap year (before 1582)
      [28, 2, 1800], // day<=28 in february in non-leap year (after 1582)
      [28, 2, 1802], // day<=28 in february in non-leap year (after 1582)
      [29, 2, 1600], // day<=29 in february in leap year (after 1582)
      [29, 2, 1904] // day<=29 in february in leap year (after 1582)
    ]
    for (const input of inputs) {
      expect(() => validateDate(...input, false)).to.not.throw('This date does not exist')
    }
  })
})

describe('archScopeToEtdfDate', () => {
  it('should transform ArchScope format to EDTF format', () => {
    const examples = [
      { input: '12.08.1956', output: '1956-08-12' },
      { input: '12.8.1956', output: '1956-08-12' },
      { input: '06.11.1956', output: '1956-11-06' },
      { input: '30.11.0156', output: '0156-11-30' },
      { input: '30.11.0056', output: '0056-11-30' },
      { input: '30.11.0056', output: '0056-11-30' },
      { input: '0056.11.30', output: '0056-11-30' },
      { input: '30.11.0056 v. Chr.', output: '-0055-11-30' },
      { input: '12.1538', output: '1538-12' },
      { input: '1538.12', output: '1538-12' },
      { input: '1538.3', output: '1538-03' },
      { input: '03.1538', output: '1538-03' },
      { input: '3.1538', output: '1538-03' },
      { input: '12.0036', output: '0036-12' },
      { input: '12.0036 v. Chr.', output: '-0035-12' },
      { input: '1236', output: '1236' },
      { input: '0008', output: '0008' },
      { input: '1236 v. Chr.', output: '-1235' },
      { input: '19. Jh.', output: '19xx' },
      { input: '08. Jh.', output: '08xx' },
      { input: '19. Jh. v. Chr.', output: '-19xx' },
      { input: '08. Jh. v. Chr.', output: '-08xx' }
    ]
    for (const example of examples) {
      strictEqual(archScopeToEtdfDate(example.input), example.output)
    }
  })

  it('should produce an error when date format is invalid', () => {
    const inputs = ['12-11-1989', '11.13.1568', '01011990', '-1990-01-03']
    for (const input of inputs) {
      expect(() => archScopeToEtdfDate(input)).to.throw()
    }
  })
})

describe('etdfToIsoDate', () => {
  it('should transform etdf date to ISO datetime (@ day beginning)', () => {
    const examples = [
      { input: '36', output: '0036-01-01T00:00:00' },
      { input: '836', output: '0836-01-01T00:00:00' },
      { input: '1956', output: '1956-01-01T00:00:00' },
      { input: '1876-02', output: '1876-02-01T00:00:00' },
      { input: '1976-05', output: '1976-05-01T00:00:00' },
      { input: '1976-11', output: '1976-11-01T00:00:00' },
      { input: '1976-11-03', output: '1976-11-03T00:00:00' },
      { input: '1976-11-23', output: '1976-11-23T00:00:00' },
      { input: '36~', output: '0036-01-01T00:00:00' },
      { input: '836~', output: '0836-01-01T00:00:00' },
      { input: '1956~', output: '1956-01-01T00:00:00' },
      { input: '1876-02~', output: '1876-02-01T00:00:00' },
      { input: '1976-05~', output: '1976-05-01T00:00:00' },
      { input: '1976-11~', output: '1976-11-01T00:00:00' },
      { input: '1976-11-03~', output: '1976-11-03T00:00:00' },
      { input: '1976-11-23~', output: '1976-11-23T00:00:00' }
    ]
    for (const example of examples) {
      strictEqual(etdfToIsoDate(example.input, true), example.output)
    }
  })

  it('should transform etdf date to ISO datetime (@ day end)', () => {
    const examples = [
      { input: '36', output: '0036-12-31T23:59:59' },
      { input: '836', output: '0836-12-31T23:59:59' },
      { input: '1956', output: '1956-12-31T23:59:59' },
      { input: '1875-02', output: '1875-02-28T23:59:59' },
      { input: '1700-02', output: '1700-02-28T23:59:59' },
      { input: '1704-02', output: '1704-02-29T23:59:59' },
      { input: '2000-02', output: '2000-02-29T23:59:59' },
      { input: '1976-05', output: '1976-05-31T23:59:59' },
      { input: '1976-11', output: '1976-11-30T23:59:59' },
      { input: '1976-11-03', output: '1976-11-03T23:59:59' },
      { input: '1976-11-23', output: '1976-11-23T23:59:59' }
    ]
    for (const example of examples) {
      strictEqual(etdfToIsoDate(example.input, false), example.output)
    }
  })
})
