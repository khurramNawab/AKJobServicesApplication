/**
 * Reusable pagination helper for all list APIs.
 *
 * Usage in controller:
 *   const { query, pagination } = buildPagination(req.query);
 *   const docs = await Model.find(query.filter).sort(query.sort).skip(query.skip).limit(query.limit);
 *   res.json({ success: true, ...pagination(await Model.countDocuments(query.filter)), data: docs });
 */
export const buildPagination = (queryParams) => {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 20));  // cap at 100
    const skip = (page - 1) * limit;

    // Sort — default newest first, supports `?sort=title` or `?sort=-createdAt`
    const sortField = queryParams.sort || '-createdAt';
    const sort = {};
    if (sortField.startsWith('-')) {
        sort[sortField.substring(1)] = -1;
    } else {
        sort[sortField] = 1;
    }

    // Search — generic text search on a field
    const filter = {};
    if (queryParams.search && queryParams.searchField) {
        filter[queryParams.searchField] = { $regex: queryParams.search, $options: 'i' };
    }

    return {
        query: { filter, sort, skip, limit, page },
        /**
         * Call with total document count to get pagination metadata.
         */
        pagination: (totalDocs) => ({
            pagination: {
                page,
                limit,
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit),
                hasNextPage: page * limit < totalDocs,
                hasPrevPage: page > 1,
            },
        }),
    };
};
