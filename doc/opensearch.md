# Opensearch

We use Opensearch to assist with searching for professions on the public-facing side of the
site.

At the point of publication, professions are indexed in the Opensearch database. When users
search for keywords, we search Opensearch for them and return the IDs of the matching
professions.

## Reindexing professions

If, for some reason, we need to reindex the professions, we can do so with the following
command:

```bash
script/npm run opensearch:reseed:professions
```

This will clear out the index, and reindex the all the live professions.
