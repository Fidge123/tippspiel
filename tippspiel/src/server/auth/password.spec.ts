import { describe, expect, test } from "bun:test";
import { generateSalt, hashPassword, verifyPassword } from "./password";

process.env.PASSWORD_PEPPER = "test-pepper-for-unit-tests";

describe("Password utilities", () => {
  describe("generateSalt", () => {
    test("should generate a long hex string", () => {
      const salt = generateSalt();
      expect(salt.length > 32).toBeTrue();
      expect(salt).toMatch(/^[a-f0-9]{32,}$/);
    });

    test("should generate unique salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe("hashPassword", () => {
    test("should hash password with salt", async () => {
      const password = "testpassword123";
      const salt = "1234567890abcdef";

      const hash = await hashPassword(password, salt);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^[a-f0-9]+$/);
      expect(hash.length >= 128).toBeTrue();
    });

    test("should produce different hashes for different passwords", async () => {
      const salt = "1234567890abcdef";

      const hash1 = await hashPassword("password1", salt);
      const hash2 = await hashPassword("password2", salt);

      expect(hash1).not.toBe(hash2);
    });

    test("should produce different hashes for different salts", async () => {
      const password = "testpassword123";

      const hash1 = await hashPassword(password, "1111");
      const hash2 = await hashPassword(password, "1112");

      expect(hash1).not.toBe(hash2);
    });

    test("should produce consistent hashes for same password and salt", async () => {
      const password = "testpassword123";
      const salt = "1234567890abcdef";

      const hash1 = await hashPassword(password, salt);
      const hash2 = await hashPassword(password, salt);

      expect(hash1).toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    test("should verify correct password", async () => {
      const password = "testpassword123";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await verifyPassword(password, salt, hash);

      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await verifyPassword(wrongPassword, salt, hash);

      expect(isValid).toBe(false);
    });

    test("should reject with wrong salt", async () => {
      const password = "testpassword123";
      const salt = generateSalt();
      const wrongSalt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await verifyPassword(password, wrongSalt, hash);

      expect(isValid).toBe(false);
    });

    test("should work with various characters", async () => {
      const passwords = ["Password123!@#$%^&*()", "ñáéíóúüç", "🔒🔑💻"];

      for (const password of passwords) {
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword(password, salt, hash);

        expect(isValid).toBe(true);
      }
    });
  });
});
