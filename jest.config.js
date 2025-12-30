/**
 * Jest 테스트 설정
 * TypeScript 프로젝트를 위한 Jest 설정
 *
 * - Unit 테스트: Mock 기반
 * - Integration 테스트: 실제 호출
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/unit/**/*.test.ts',
    '**/__tests__/integration/**/*.integration.test.ts'
  ],
  testTimeout: 10000, // Unit 테스트 기본 타임아웃 (10초)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Integration 테스트는 수동으로 실행 (느릴 수 있음)
  // npm test -- --testPathPattern=integration
};
