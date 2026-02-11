export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: false }] },
  moduleNameMapper: {
    '^react-native-mmkv$': '<rootDir>/src/lib/__tests__/__mocks__/mmkv.ts',
    '^react-native$': '<rootDir>/src/lib/__tests__/__mocks__/react-native.ts',
    '^expo-haptics$': '<rootDir>/src/lib/__tests__/__mocks__/expo-haptics.ts',
    'src/lib/data/badges': '<rootDir>/src/lib/__tests__/__mocks__/badges.ts',
    'src/lib/data/challenges': '<rootDir>/src/lib/__tests__/__mocks__/challenges.ts',
  },
};
