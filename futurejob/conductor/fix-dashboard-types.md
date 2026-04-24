# Fix TypeScript Errors in Admin Dashboard Service

## Objective
The `lib/admin/dashboard.ts` file contains TypeScript errors, likely caused by the `getCollectionSnapshotOrEmpty` function returning an `unknown` type, which results in `Object is of type 'unknown'` errors when attempting to access `.docs` and `.size` on the returned snapshots.

## Proposed Change
Update the `getCollectionSnapshotOrEmpty` function to use TypeScript generics. This will preserve the correct `QuerySnapshot` type returned by Firestore, eliminating the `unknown` type errors throughout the file.

```typescript
async function getCollectionSnapshotOrEmpty<T>(
  queryPromise: Promise<T>,
  collectionName: string
): Promise<T | { docs: any[]; size: number }> {
  try {
    return await queryPromise;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn(
        `[admin dashboard] permission denied when reading ${collectionName}; rendering with empty data.`
      );
      return { docs: [], size: 0 };
    }

    throw error;
  }
}
```

Also, update any places where we implicitly typed `.docs` maps with an explicit `any` if it still complains, though the generic should fix the root of the problem.

## Files to Update
- `lib/admin/dashboard.ts`