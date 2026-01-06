import React, { useState, useEffect } from 'react';

const RoleTreeView = ({ data, selectedPermissions = [], onPermissionsChange }) => {
    const [treeData, setTreeData] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});

    // Parse access data from various formats
    const parseAccessData = (access) => {
        if (!access) return [];

        try {
            let accessArray = [];

            // Handle string format
            if (typeof access === 'string') {
                accessArray = JSON.parse(access);
            }
            // Handle array format
            else if (Array.isArray(access)) {
                accessArray = access;
            }

            // Filter and convert access IDs
            return accessArray
                .filter((a) => a && a.accessId !== null && a.accessId !== undefined && a.accessName)
                .map((a) => ({
                    ...a,
                    accessId: parseInt(a.accessId),
                }));
        } catch (error) {
            console.error('Error parsing access data:', error);
            return [];
        }
    };

    useEffect(() => {
        if (!Array.isArray(data)) {
            setTreeData([]);
            return;
        }

        // Separate titles and pages
        const titles = data.filter((item) => item.isTitle === 1);
        const pages = data.filter((item) => item.isTitle !== 1);

        // Group pages under their respective titles
        const groupedData = titles
            .map((title) => {
                const childPages = pages.filter((page) => page.parentId === title.pageId);

                const childrenWithAccess = childPages.map((page) => ({
                    ...page,
                    access: parseAccessData(page.access),
                }));

                return {
                    ...title,
                    children: childrenWithAccess.filter((child) => child.access.length > 0),
                };
            })
            .filter((group) => group.children.length > 0);

        // Add standalone pages (pages without a title parent but with access)
        const standalonePages = pages
            .filter((page) => {
                const hasParent = titles.some((title) => title.pageId === page.parentId) || pages.some((otherPage) => otherPage.pageId === page.parentId);
                return !hasParent;
            })
            .map((page) => ({
                ...page,
                access: parseAccessData(page.access),
            }))
            .filter((page) => page.access.length > 0);

        standalonePages.forEach((page) => {
            groupedData.push({
                ...page,
                children: [],
            });
        });

        setTreeData(groupedData);

        // Expand all groups by default
        const expanded = {};
        groupedData.forEach((group) => {
            expanded[group.pageId] = true;
        });
        setExpandedGroups(expanded);
    }, [data]);

    const toggleExpand = (pageId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [pageId]: !prev[pageId],
        }));
    };

    const handlePermissionChange = (pageId, accessId, isChecked) => {
        const newPermissions = [...selectedPermissions];
        const permissionKey = `${pageId}_${accessId}`;

        if (isChecked) {
            // Add permission if not already present
            if (!newPermissions.includes(permissionKey)) {
                newPermissions.push(permissionKey);
            }
        } else {
            // Remove permission
            const index = newPermissions.indexOf(permissionKey);
            if (index > -1) {
                newPermissions.splice(index, 1);
            }
        }

        onPermissionsChange(newPermissions);
    };

    const handlePageAllPermissionsChange = (pageId, accessIds, isChecked) => {
        const newPermissions = [...selectedPermissions];

        accessIds.forEach((accessId) => {
            const permissionKey = `${pageId}_${accessId}`;

            if (isChecked) {
                // Add all permissions for this page
                if (!newPermissions.includes(permissionKey)) {
                    newPermissions.push(permissionKey);
                }
            } else {
                // Remove all permissions for this page
                const index = newPermissions.indexOf(permissionKey);
                if (index > -1) {
                    newPermissions.splice(index, 1);
                }
            }
        });

        onPermissionsChange(newPermissions);
    };

    const isPageFullyChecked = (pageId, accessIds) => {
        if (!accessIds || accessIds.length === 0) return false;

        return accessIds.every((accessId) => selectedPermissions.includes(`${pageId}_${accessId}`));
    };

    const isPagePartiallyChecked = (pageId, accessIds) => {
        if (!accessIds || accessIds.length === 0) return false;

        const hasSome = accessIds.some((accessId) => selectedPermissions.includes(`${pageId}_${accessId}`));

        const allChecked = isPageFullyChecked(pageId, accessIds);

        return hasSome && !allChecked;
    };

    // Get access name by ID or use the provided accessName
    const getAccessName = (access) => {
        if (access.accessName) return access.accessName;

        const accessMap = {
            1: 'View',
            2: 'Create',
            3: 'Update',
            4: 'Delete',
            5: 'Print',
        };

        return accessMap[access.accessId] || `Access ${access.accessId}`;
    };

    const renderPagePermissions = (page, isChild = false) => {
        const accessIds = page.access.map((a) => a.accessId);
        const isAllChecked = isPageFullyChecked(page.pageId, accessIds);
        const isPartialChecked = isPagePartiallyChecked(page.pageId, accessIds);

        return (
            <div key={page.pageId} className={`${isChild ? 'ml-6' : ''} border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0 mb-3`}>
                {/* Page header with select all checkbox */}
                <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 mb-2">
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-2 focus:ring-offset-2 dark:bg-gray-700"
                        checked={isAllChecked}
                        ref={(input) => {
                            if (input) {
                                input.indeterminate = isPartialChecked;
                            }
                        }}
                        onChange={(e) => handlePageAllPermissionsChange(page.pageId, accessIds, e.target.checked)}
                    />
                    <span className="text-sm">{page.pageName || page.text || page.title}</span>
                </div>

                {/* Individual access checkboxes */}
                {page.access.length > 0 && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                        {page.access.map((access) => {
                            const permissionKey = `${page.pageId}_${access.accessId}`;
                            const isChecked = selectedPermissions.includes(permissionKey);

                            return (
                                <label key={permissionKey} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-1 focus:ring-offset-1 dark:bg-gray-700"
                                        checked={isChecked}
                                        onChange={(e) => handlePermissionChange(page.pageId, access.accessId, e.target.checked)}
                                    />
                                    <span>{getAccessName(access)}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="border rounded p-4 max-h-96 overflow-y-auto bg-white dark:bg-gray-800">
            {treeData.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">{data.length === 0 ? 'No pages available' : 'No pages with permissions available'}</div>
            ) : (
                treeData.map((item) => {
                    const isExpanded = expandedGroups[item.pageId] !== false;
                    const isTitle = item.isTitle === 1;
                    const hasChildren = item.children && item.children.length > 0;

                    if (isTitle && hasChildren) {
                        return (
                            <div key={item.pageId} className="mb-3">
                                {/* Title Header */}
                                <div
                                    className="flex items-center gap-2 cursor-pointer font-semibold text-gray-900 dark:text-gray-100 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                    onClick={() => toggleExpand(item.pageId)}
                                >
                                    <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                                    <span>{item.title || item.pageName}</span>
                                </div>

                                {/* Child Pages */}
                                {isExpanded && <div className="ml-4 mt-2 space-y-3">{item.children.map((child) => renderPagePermissions(child, true))}</div>}
                            </div>
                        );
                    } else {
                        // Standalone pages or titles without children
                        return renderPagePermissions(item);
                    }
                })
            )}
        </div>
    );
};

export default RoleTreeView;
