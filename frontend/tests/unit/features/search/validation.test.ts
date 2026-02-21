/**
 * Validation Utility Tests
 */

import { describe, it, expect } from 'vitest'
import { validateUsername } from '../../../../src/features/search/utils/validation'

describe('validateUsername', () => {
  describe('valid usernames', () => {
    it('accepts single character username', () => {
      const result = validateUsername('a')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts alphanumeric username', () => {
      const result = validateUsername('octocat')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts username with hyphens', () => {
      const result = validateUsername('my-user-123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts username with consecutive hyphens', () => {
      const result = validateUsername('my--user')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts username with numbers', () => {
      const result = validateUsername('user123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts maximum length username (39 characters)', () => {
      const result = validateUsername('a'.repeat(39))
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts username starting with number', () => {
      const result = validateUsername('123user')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts username ending with number', () => {
      const result = validateUsername('user123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('empty username', () => {
    it('rejects empty string', () => {
      const result = validateUsername('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username is required')
    })

    it('rejects whitespace-only string', () => {
      const result = validateUsername('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username is required')
    })
  })

  describe('too long username', () => {
    it('rejects username longer than 39 characters', () => {
      const result = validateUsername('a'.repeat(40))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username must be 39 characters or less')
    })

    it('rejects username with 50 characters', () => {
      const result = validateUsername('a'.repeat(50))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username must be 39 characters or less')
    })
  })

  describe('invalid format', () => {
    it('rejects username starting with hyphen', () => {
      const result = validateUsername('-username')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username ending with hyphen', () => {
      const result = validateUsername('username-')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with spaces', () => {
      const result = validateUsername('user name')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with special characters (@)', () => {
      const result = validateUsername('user@name')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with special characters (.)', () => {
      const result = validateUsername('user.name')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with special characters (_)', () => {
      const result = validateUsername('user_name')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with special characters (!)', () => {
      const result = validateUsername('user!name')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })

    it('rejects username with only hyphen', () => {
      const result = validateUsername('-')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain alphanumeric characters and hyphens')
    })
  })

  describe('edge cases', () => {
    it('is a pure function (same input produces same output)', () => {
      const username = 'octocat'
      const result1 = validateUsername(username)
      const result2 = validateUsername(username)
      expect(result1).toEqual(result2)
    })

    it('handles mixed case usernames', () => {
      const result = validateUsername('MyUsername')
      expect(result.isValid).toBe(true)
    })

    it('handles all numeric username', () => {
      const result = validateUsername('123456')
      expect(result.isValid).toBe(true)
    })
  })
})
