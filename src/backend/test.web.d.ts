/**
 * Type declarations for test.web.js
 */

interface TestResult {
  success: boolean;
  logs: string[];
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

export function sayHello(): Promise<TestResult>;
export function testInsert(): Promise<TestResult>;
export function testQuery(): Promise<TestResult>;
export function testDelete(itemId: string): Promise<TestResult>;

