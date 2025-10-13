# Design Patterns & Best Practices

## Overview

Common design patterns and best practices for building applications with the HeroUI + shadcn/ui design system.

## Core Patterns

### 1. Consistent Spacing

Always use the 4px spacing grid from design tokens.

✅ **Good:**
```tsx
<Card style={{
  padding: 'var(--sp-space-6)',
  gap: 'var(--sp-space-4)',
  marginBottom: 'var(--sp-space-8)'
}}>
  <h2>Title</h2>
  <p>Content with consistent spacing</p>
</Card>
```

❌ **Avoid:**
```tsx
<Card style={{
  padding: '18px',    // Not on 4px grid
  gap: '15px',        // Not on 4px grid
  marginBottom: '35px' // Not on 4px grid
}}>
```

### 2. Semantic Color Usage

Use colors by meaning, not appearance.

✅ **Good:**
```tsx
<Button variant="primary" color="accent">  // Semantic
  Primary Action
</Button>

<Alert variant="error">  // Semantic
  Error message
</Alert>
```

❌ **Avoid:**
```tsx
<Button style={{ background: '#7828c8' }}>  // Hardcoded
  Button
</Button>
```

### 3. Accessible Components

Ensure all interactive elements are keyboard-accessible and screen reader-friendly.

✅ **Good:**
```tsx
<button
  aria-label="Close dialog"
  onClick={onClose}
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <CloseIcon aria-hidden="true" />
</button>
```

❌ **Avoid:**
```tsx
<div onClick={onClose}>  // Not keyboard accessible
  <CloseIcon />
</div>
```

## Component Composition Patterns

### Container Pattern

Group related content in semantic containers.

```tsx
function ProfileCard({ user }) {
  return (
    <Card className="profile-card">
      <Card.Header>
        <Avatar src={user.avatar} />
        <Text weight="bold">{user.name}</Text>
      </Card.Header>

      <Card.Body>
        <Text>{user.bio}</Text>
      </Card.Body>

      <Card.Footer>
        <Button variant="outline">Follow</Button>
        <Button variant="primary">Message</Button>
      </Card.Footer>
    </Card>
  );
}
```

### Compound Components Pattern

Build flexible component APIs with compound components.

```tsx
// Definition
function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

Select.Option = function SelectOption({ children, ...props }) {
  return <option {...props}>{children}</option>;
};

// Usage
<Select label="Country">
  <Select.Option value="us">United States</Select.Option>
  <Select.Option value="uk">United Kingdom</Select.Option>
  <Select.Option value="ca">Canada</Select.Option>
</Select>
```

### Render Props Pattern

Share logic between components with render props.

```tsx
function DataFetcher({ url, render }) {
  const { data, loading, error } = useFetch(url);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return render(data);
}

// Usage
<DataFetcher
  url="/api/users"
  render={(users) => (
    <UserList users={users} />
  )}
/>
```

### Custom Hooks Pattern

Extract reusable logic into custom hooks.

```tsx
// Custom hook
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    // Validation logic...
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { values, errors, handleChange, validate };
}

// Usage
function ContactForm() {
  const { values, errors, handleChange, validate } = useForm({
    name: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />
      {/* More fields... */}
    </form>
  );
}
```

## Layout Patterns

### Responsive Grid

```tsx
function ProductGrid({ products }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--sp-space-6)'
    }}>
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
```

### Sidebar Layout

```tsx
function DashboardLayout({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: 'var(--sp-space-6)',
      minHeight: '100vh'
    }}>
      <aside style={{
        padding: 'var(--sp-space-6)',
        background: 'var(--sp-colors-bg-active)'
      }}>
        <Sidebar />
      </aside>

      <main style={{ padding: 'var(--sp-space-6)' }}>
        {children}
      </main>
    </div>
  );
}
```

### Card Grid with CTA

```tsx
function PricingSection() {
  return (
    <section>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--sp-space-8)',
        padding: 'var(--sp-space-8)'
      }}>
        {plans.map(plan => (
          <PricingCard key={plan.id} {...plan} />
        ))}
      </div>
    </section>
  );
}
```

## Form Patterns

### Controlled Inputs

```tsx
function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });

  const handleChange = (field) => (e) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        label="Email"
        value={values.email}
        onChange={handleChange('email')}
        required
      />

      <Input
        type="password"
        label="Password"
        value={values.password}
        onChange={handleChange('password')}
        required
      />

      <Button type="submit">Log in</Button>
    </form>
  );
}
```

### Form Validation

```tsx
function RegistrationForm() {
  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const newErrors = {};

    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleSubmit = (values) => {
    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit form
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <Input name="email" error={errors.email} />
      <Input name="password" type="password" error={errors.password} />
      <Button type="submit">Sign up</Button>
    </form>
  );
}
```

## State Management Patterns

### Local State with useState

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Text>Count: {count}</Text>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Context for Global State

```tsx
// Create context
const ThemeContext = createContext();

// Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
```

## Data Fetching Patterns

### Loading States

```tsx
function UserProfile({ userId }) {
  const { data, loading, error } = useQuery(`/api/users/${userId}`);

  if (loading) {
    return <Skeleton variant="profile" />;
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load profile: {error.message}
      </Alert>
    );
  }

  return <ProfileCard user={data} />;
}
```

### Optimistic Updates

```tsx
function TodoItem({ todo }) {
  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const handleToggle = async () => {
    // Optimistic update
    setIsCompleted(!isCompleted);

    try {
      await updateTodo(todo.id, { completed: !isCompleted });
    } catch (error) {
      // Revert on error
      setIsCompleted(isCompleted);
      showToast('Failed to update todo', { variant: 'error' });
    }
  };

  return (
    <div>
      <Checkbox
        checked={isCompleted}
        onChange={handleToggle}
      />
      <Text strikethrough={isCompleted}>{todo.title}</Text>
    </div>
  );
}
```

## Error Handling Patterns

### Error Boundaries

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="error">
          <Alert.Title>Something went wrong</Alert.Title>
          <Alert.Description>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Alert.Description>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### Try-Catch with Toast

```tsx
function DeleteButton({ itemId, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteItem(itemId);
      showToast('Item deleted successfully', { variant: 'success' });
      onDelete?.();
    } catch (error) {
      showToast(
        error.message || 'Failed to delete item',
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      isLoading={isLoading}
    >
      Delete
    </Button>
  );
}
```

## Performance Patterns

### Memoization

```tsx
function ExpensiveList({ items, filter }) {
  // Memoize expensive computation
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <ul>
      {filteredItems.map(item => (
        <ExpensiveListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

// Memoize component to prevent unnecessary re-renders
const ExpensiveListItem = memo(({ item }) => {
  return (
    <li>
      {/* Expensive rendering logic */}
    </li>
  );
});
```

### Virtualization for Long Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Accessibility Patterns

### Keyboard Navigation

```tsx
function Menu({ items, onSelect }) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      case 'Escape':
        onSelect(null);
        break;
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Focus Management

```tsx
function Modal({ isOpen, onClose, children }) {
  const previousFocusRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;

      // Focus modal
      modalRef.current?.focus();
    } else {
      // Restore focus
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
```

## Testing Patterns

### Component Testing

```tsx
import { render, screen, userEvent } from '@testing-library/react';

describe('SearchInput', () => {
  it('calls onSearch when Enter is pressed', async () => {
    const onSearch = jest.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test query{Enter}');

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('clears input when clear button is clicked', async () => {
    render(<SearchInput />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    const clearButton = screen.getByLabelText('Clear');
    await userEvent.click(clearButton);

    expect(input).toHaveValue('');
  });
});
```

## Anti-Patterns to Avoid

### ❌ Prop Drilling

```tsx
// Bad: Passing props through many levels
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} setUser={setUser} />;
}

function Layout({ user, setUser }) {
  return <Header user={user} setUser={setUser} />;
}

function Header({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}
```

✅ **Solution: Use Context**

```tsx
// Good: Use context for deeply nested props
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  );
}
```

### ❌ Unnecessary Re-renders

```tsx
// Bad: Creating new objects/functions on every render
function List() {
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          onClick={() => handleClick(item)}  // New function every render
          style={{ padding: '10px' }}         // New object every render
        />
      ))}
    </div>
  );
}
```

✅ **Solution: Memoize or Move Out**

```tsx
// Good: Memoize callbacks and stable references
function List() {
  const handleClick = useCallback((item) => {
    // Handle click
  }, []);

  const itemStyle = useMemo(() => ({
    padding: 'var(--sp-space-3)'
  }), []);

  return (
    <div>
      {items.map(item => (
        <MemoizedItem
          key={item.id}
          onClick={() => handleClick(item)}
          style={itemStyle}
        />
      ))}
    </div>
  );
}
```

## Best Practices Checklist

- [ ] Use design tokens for all spacing and colors
- [ ] Follow 4px spacing grid consistently
- [ ] Include ARIA attributes for interactive elements
- [ ] Support keyboard navigation
- [ ] Provide loading and error states
- [ ] Memoize expensive computations
- [ ] Use semantic HTML elements
- [ ] Test accessibility with screen readers
- [ ] Implement proper focus management
- [ ] Handle errors gracefully with user feedback

## Resources

- [React Patterns](https://reactpatterns.com/)
- [Accessible Components](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Design Tokens](../design-tokens/) - Token reference
- [Component Library](../components/) - Component docs

---

**Last Updated**: October 2025
**Pattern Categories**: 10+ categories with examples
