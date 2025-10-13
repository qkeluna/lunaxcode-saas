# Component Relationship Graph

```mermaid
graph TD
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    use_multiselect[use-multiselect]
    index[index]
    use_multiselect_list_state[use-multiselect-list-state]
    use_multiselect_state[use-multiselect-state]
    use_multiselect_state --> use_multiselect_list_state
    use_multiselect_state --> use_multiselect_list_state
    index[index]
    index[index]
    index[index]
    use_accordion[use-accordion]
    use_accordion_item[use-accordion-item]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]
    index[index]

```

## Analysis

- **Total Components**: 671
- **Average Dependencies**: 0.9
- **Most Complex**: use-select

## Insights

Components with many dependencies may benefit from refactoring to reduce coupling.
