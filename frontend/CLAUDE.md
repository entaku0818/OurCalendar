# OurCalendar Frontend - Claude Code Guide

## Project Overview
React Native calendar app with Expo, featuring Google Calendar integration and group sharing functionality.

## Tech Stack
- React Native 0.81 with Expo SDK 54
- TypeScript
- React Navigation 7
- AsyncStorage for local persistence
- Hermes JavaScript engine

## React Native Best Practices (from Callstack)

### Performance Priority Order
1. **CRITICAL**: FPS & Re-renders - Use virtualized lists, memoization
2. **CRITICAL**: Bundle Size - Analyze with source-map-explorer, avoid barrel imports
3. **HIGH**: TTI (Time to Interactive) - Measure cold starts
4. **HIGH**: Native Performance - Profile with Xcode/Android Studio
5. **MEDIUM-HIGH**: Memory Management - Hunt JS and native leaks
6. **MEDIUM**: Animations - Use Reanimated worklets

### JavaScript/React Optimization

#### Memoization Rules
```typescript
// Always use React.memo for reusable components
const Button = memo(function Button(props) { ... });

// useCallback for event handlers passed to children
const handlePress = useCallback(() => {
  // handler logic
}, [dependencies]);

// useMemo for expensive computations
const sortedItems = useMemo(() =>
  items.sort((a, b) => a.date - b.date),
  [items]
);
```

#### List Optimization
- Use `FlatList` instead of `ScrollView` for dynamic lists
- Consider `FlashList` for very large lists (1000+ items)
- Always provide `keyExtractor` and stable keys
- Use `getItemLayout` when item heights are fixed
- Memoize `renderItem` components

```typescript
// Good
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

#### Avoid Inline Objects/Functions in JSX
```typescript
// Bad - creates new object every render
<View style={{ marginTop: 10 }} />
<Button onPress={() => doSomething()} />

// Good - define outside or use useMemo/useCallback
const marginStyle = useMemo(() => ({ marginTop: 10 }), []);
const handlePress = useCallback(() => doSomething(), []);
```

### Bundle Optimization

#### Avoid Barrel Exports
```typescript
// Bad - imports entire module
import { Button } from '../components';

// Good - direct imports
import Button from '../components/Button';
```

#### Tree Shaking
- Use named exports where possible
- Avoid side effects in module scope
- Use `sideEffects: false` in package.json when safe

### Native Optimization

#### Hermes
- Enabled by default in Expo SDK 54
- Verify with `global.HermesInternal`
- Use Hermes bytecode for faster startup

#### Image Optimization
- Use appropriate image sizes (1x, 2x, 3x)
- Prefer PNG for icons, JPEG for photos
- Consider WebP format for better compression
- Use `resizeMode` appropriately

### Quick Diagnostics

| Problem | First Action | Then |
|---------|-------------|------|
| Janky UI | Measure FPS | Profile React renders |
| Slow startup | Measure TTI | Analyze bundle |
| Memory growth | Check JS heap | Hunt native leaks |
| List scrolling | Use FlatList | Try FlashList |
| Large bundle | Analyze size | Remove unused deps |

## Project Structure
```
src/
├── components/     # Reusable UI components (memoized)
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── store/          # Context providers
├── services/       # API and storage services
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── utils/          # Utility functions and constants
```

## Commands
- `npm start` - Start Expo development server
- `npm test` - Run Jest tests
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

## Testing
- Jest with ts-jest for unit tests
- Tests in `src/__tests__/` directory
- Run `npm test` before committing
