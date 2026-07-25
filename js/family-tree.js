(function() {
    const data = window.FAMILY_TREE_DATA;
    if (!data) return;

    const viewport = document.getElementById('treeViewport');
    const stage = document.getElementById('treeStage');
    const canvas = document.getElementById('treeCanvas');
    const linesSvg = document.getElementById('treeLines');
    const nodesLayer = document.getElementById('treeNodes');
    const treeThemeToggle = document.getElementById('treeThemeToggle');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchStatus = document.getElementById('searchStatus');
    const recenterBtn = document.getElementById('recenterBtn');
    const reorganiseBtn = document.getElementById('reorganiseBtn');
    const collapseBranchBtn = document.getElementById('collapseBranchBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const layoutStorageKey = 'familyTree.layout.v3';
    const connectorTooltip = document.createElement('div');

    if (!viewport || !stage || !canvas || !linesSvg || !nodesLayer) return;

    const canvasWidth = data.canvas?.width || 6200;
    const canvasHeight = data.canvas?.height || 3600;
    const cardHalfWidth = 94;
    const cardHalfHeight = 84;
    let linkRenderFrame = null;
    let searchFocusTimer = null;
    let activeLinkPath = null;
    let selectedPersonId = data.rootId;
    const collapsedRoots = new Set();
    let hiddenBranchIds = new Set();

    let zoomScale = 1;
    const zoomMin = 0.5;
    const zoomMax = 2.2;
    const zoomStep = 0.12;
    const activePointers = new Map();
    let pinchStartDistance = null;
    let pinchStartScale = 1;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    linesSvg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
    connectorTooltip.className = 'connector-tooltip';
    connectorTooltip.setAttribute('role', 'status');
    connectorTooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(connectorTooltip);

    const peopleMap = new Map();
    const cardMap = new Map();
    const defaultLayout = {};
    const groupByPerson = buildGroupMetadata();
    const groupColorMap = buildGroupColors();
    const personColorMap = buildPersonColorMap();
    const coupleMeta = buildCoupleMetadata();
    const childIndex = buildChildIndex();
    buildClusteredLayout();
    loadSavedLayout();
    renderNodes();
    renderLinks();
    applyZoom(1, null, null, false);
    applyTreeTheme(getThemeState());
    centerOnPerson(data.rootId, 'auto');
    setSearchStatus('Tip: search by name or relation.');
    updateCollapseButtonLabel();

    recenterBtn?.addEventListener('click', () => centerOnPerson(data.rootId, 'smooth'));
    reorganiseBtn?.addEventListener('click', () => {
        reorganiseToDefaultLayout();
        centerOnPerson(data.rootId, 'smooth');
    });
    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keydown', event => {
        if (event.key === 'Enter') handleSearch();
    });
    collapseBranchBtn?.addEventListener('click', toggleCollapseSelectedBranch);
    expandAllBtn?.addEventListener('click', expandAllBranches);
    treeThemeToggle?.addEventListener('click', toggleTreeTheme);
    zoomInBtn?.addEventListener('click', () => applyZoom(zoomScale + zoomStep));
    zoomOutBtn?.addEventListener('click', () => applyZoom(zoomScale - zoomStep));

    viewport.addEventListener('wheel', onWheelZoom, { passive: false });
    viewport.addEventListener('pointerdown', onViewportPointerDown);
    viewport.addEventListener('pointermove', onViewportPointerMove);
    viewport.addEventListener('pointerup', onViewportPointerUp);
    viewport.addEventListener('pointercancel', onViewportPointerUp);
    window.addEventListener('resize', scheduleRenderLinks);

    window.familyTreeApi = {
        centerOnPerson,
        reorganiseToDefaultLayout,
        searchMember: query => {
            if (searchInput) searchInput.value = query;
            handleSearch();
        },
        zoomIn: () => applyZoom(zoomScale + zoomStep),
        zoomOut: () => applyZoom(zoomScale - zoomStep),
        collapseSelectedBranch: toggleCollapseSelectedBranch,
        expandAllBranches
    };

    function buildGroupMetadata() {
        const groups = [
            ['core', ['ramji', 'bhargavi', 'adhwith']],
            ['sridaran-side', ['sridaran', 'sowmya', 'raghavendran', 'usha', 'rama', 'murali-sridaran', 'ragothama-rao', 'lakshmi-elder']],
            ['santhi-side', ['santhi', 'ranga-rao', 'sakku-bhai', 'murali-santhi', 'anathapadmanabhan', 'sandhiya-bali', 'ravi-raghavendra', 'sudha', 'ramkumar']],
            ['vasumathy-side', ['vasumathy', 'srinivasan', 'pavithra', 'abhijith', 'sudhakar-narayan', 'suresh', 'shyamala', 'ashwini', 'vadheesh', 'sumathi', 'rajagopal', 'chandra', 'harini', 'ashvin', 'bharathi', 'ananthapadmanaba-rao', 'prema', 'kesava-rao']],
            ['sudharshan-side', ['sudharshan', 'kaarunya', 'santhosh', 'ramakrishnan', 'vidhya', 'haasini', 'girija', 'lakshmi-narayanan']]
        ];
        const personToGroup = new Map();
        groups.forEach(([groupId, ids]) => ids.forEach(id => personToGroup.set(id, groupId)));
        data.people.forEach(person => {
            if (!personToGroup.has(person.id)) personToGroup.set(person.id, 'core');
        });
        return personToGroup;
    }

    function buildGroupColors() {
        const uniqueGroups = Array.from(new Set(groupByPerson.values()));
        const map = new Map();
        const curatedPalettes = [
            { start: '#f7d8de', end: '#ebc3cf', border: '#cb98a8' }, // rose mist
            { start: '#d8edf7', end: '#c3dff0', border: '#96bad2' }, // powder blue
            { start: '#dff3dc', end: '#c8e7c4', border: '#99c397' }, // soft mint
            { start: '#efe1f8', end: '#ddcaf0', border: '#b59acb' }, // lavender
            { start: '#f8e8d6', end: '#f0d8bd', border: '#c9aa85' }, // warm sand
            { start: '#dceaf7', end: '#c9dcf0', border: '#9fb8d0' }, // slate pastel
            { start: '#f6ddea', end: '#ecc8dc', border: '#c59bb6' }, // blush lilac
            { start: '#deefe9', end: '#c7e3d8', border: '#99beae' }, // eucalyptus
            { start: '#e5eaf7', end: '#d1dbf0', border: '#a7b6d1' }, // mist indigo
            { start: '#f7ebda', end: '#efdcbf', border: '#c7ad86' }  // oat cream
        ];
        const offset = Math.floor(Math.random() * curatedPalettes.length);
        uniqueGroups.forEach((groupId, index) => {
            const palette = curatedPalettes[(offset + index) % curatedPalettes.length];
            map.set(groupId, { ...palette });
        });
        return map;
    }

    function buildPersonColorMap() {
        const map = new Map();
        const palettePool = Array.from(groupColorMap.values());
        const familyMembers = new Map();
        const parentsByChild = new Map();

        data.links.forEach(link => {
            if (link.type !== 'parent') return;
            if (!parentsByChild.has(link.to)) parentsByChild.set(link.to, []);
            const list = parentsByChild.get(link.to);
            if (!list.includes(link.from)) list.push(link.from);
        });

        parentsByChild.forEach((parents, childId) => {
            const parentIds = [...parents].sort((a, b) => a.localeCompare(b));
            const familyKey = parentIds.length > 0 ? `fam:${parentIds.join('+')}` : `fam:${childId}`;
            if (!familyMembers.has(familyKey)) familyMembers.set(familyKey, new Set());
            familyMembers.get(familyKey).add(childId);
            parentIds.forEach(parentId => familyMembers.get(familyKey).add(parentId));
        });

        data.links.forEach(link => {
            if (link.type !== 'spouse') return;
            const familyKey = `couple:${getLinkKey(link.from, link.to)}`;
            if (!familyMembers.has(familyKey)) familyMembers.set(familyKey, new Set());
            familyMembers.get(familyKey).add(link.from);
            familyMembers.get(familyKey).add(link.to);
        });

        const assigned = new Set();
        const orderedFamilies = [...familyMembers.entries()].sort((a, b) => b[1].size - a[1].size);
        orderedFamilies.forEach(([familyKey, members]) => {
            const palette = palettePool[stableHash(familyKey) % palettePool.length];
            members.forEach(personId => {
                if (assigned.has(personId)) return;
                map.set(personId, palette);
                assigned.add(personId);
            });
        });

        data.people.forEach(person => {
            if (map.has(person.id)) return;
            const groupId = groupByPerson.get(person.id) || 'core';
            const palette = groupColorMap.get(groupId);
            if (palette) map.set(person.id, palette);
        });

        return map;
    }

    function stableHash(value) {
        let hash = 0;
        for (let index = 0; index < value.length; index += 1) {
            hash = ((hash << 5) - hash) + value.charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function buildCoupleMetadata() {
        const byPerson = new Map();
        const byId = new Map();
        const byLinkKey = new Map();
        const spouseLinks = data.links.filter(link => link.type === 'spouse');
        let coupleIndex = 1;

        spouseLinks.forEach(link => {
            const partnerPalette = personColorMap.get(link.from) || personColorMap.get(link.to);
            const color = partnerPalette?.border || '#9a8fb8';
            const couple = { id: `C${coupleIndex}`, color };
            coupleIndex += 1;
            byId.set(couple.id, couple);

            const fromCouples = byPerson.get(link.from) || [];
            const toCouples = byPerson.get(link.to) || [];
            fromCouples.push(couple.id);
            toCouples.push(couple.id);
            byPerson.set(link.from, fromCouples);
            byPerson.set(link.to, toCouples);
            byLinkKey.set(getLinkKey(link.from, link.to), couple.color);
        });

        return { byPerson, byId, byLinkKey };
    }

    function getLinkKey(personA, personB) {
        return [personA, personB].sort((a, b) => a.localeCompare(b)).join('::');
    }

    function getPrimaryCoupleForLink(personA, personB) {
        const coupleIdsA = coupleMeta.byPerson.get(personA) || [];
        const coupleIdsB = new Set(coupleMeta.byPerson.get(personB) || []);
        const matchedId = coupleIdsA.find(id => coupleIdsB.has(id));
        return matchedId ? coupleMeta.byId.get(matchedId) : null;
    }

    function buildClusteredLayout() {
        const sameDepthTypes = new Set(['spouse', 'sibling', 'twin', 'cousin']);
        const depths = new Map();
        depths.set(data.rootId, 0);
        const personBaseX = new Map(data.people.map(person => [person.id, Number.isFinite(person.x) ? person.x : canvasWidth / 2]));
        const spouseByPerson = buildSpouseIndex();
        const parentIndex = buildParentIndex();

        for (let i = 0; i < 30; i += 1) {
            let changed = false;
            for (const link of data.links) {
                const fromDepth = depths.get(link.from);
                const toDepth = depths.get(link.to);
                if (link.type === 'parent') {
                    if (fromDepth !== undefined && toDepth === undefined) {
                        depths.set(link.to, fromDepth + 1);
                        changed = true;
                    } else if (toDepth !== undefined && fromDepth === undefined) {
                        depths.set(link.from, toDepth - 1);
                        changed = true;
                    }
                } else if (sameDepthTypes.has(link.type)) {
                    if (fromDepth !== undefined && toDepth === undefined) {
                        depths.set(link.to, fromDepth);
                        changed = true;
                    } else if (toDepth !== undefined && fromDepth === undefined) {
                        depths.set(link.from, toDepth);
                        changed = true;
                    }
                }
            }
            if (!changed) break;
        }

        const allDepths = Array.from(depths.values());
        const minDepth = allDepths.length ? Math.min(...allDepths) : 0;
        const depthOffset = 1 - minDepth;
        const groupedByDepth = new Map();
        const assignedCenterX = new Map();

        const groupAnchors = new Map([
            ['sudharshan-side', canvasWidth / 2 - 920],
            ['sridaran-side', canvasWidth / 2 - 500],
            ['santhi-side', canvasWidth / 2 - 140],
            ['core', canvasWidth / 2 + 70],
            ['vasumathy-side', canvasWidth / 2 + 860]
        ]);

        data.people.forEach(person => {
            const depth = (depths.get(person.id) ?? 1) + depthOffset;
            if (!groupedByDepth.has(depth)) groupedByDepth.set(depth, []);
            groupedByDepth.get(depth).push(person.id);
        });

        const sortedDepths = Array.from(groupedByDepth.keys()).sort((a, b) => a - b);
        const verticalSpacing = 300;
        const topMargin = 300;
        const singleWidth = 196;
        const spouseSpacing = 152;
        const coupleWidth = spouseSpacing + 118;
        const unitGap = 72;
        const groupGap = 118;

        sortedDepths.forEach(depth => {
            const ids = groupedByDepth.get(depth);
            const units = buildDepthUnits(ids, spouseByPerson, personBaseX);
            const entries = units.map((unit, idx) => {
                const groupId = dominantGroupId(unit.ids);
                const groupAnchor = groupAnchors.get(groupId) ?? (canvasWidth / 2);
                const parentAnchors = [];
                unit.ids.forEach(personId => {
                    const parentIds = parentIndex.get(personId) || [];
                    const anchors = parentIds
                        .map(parentId => assignedCenterX.get(parentId))
                        .filter(value => Number.isFinite(value));
                    if (anchors.length === 2 && areSpousePair(parentIds[0], parentIds[1], spouseByPerson)) {
                        parentAnchors.push((anchors[0] + anchors[1]) / 2);
                    } else if (anchors.length > 0) {
                        parentAnchors.push(anchors.reduce((sum, value) => sum + value, 0) / anchors.length);
                    }
                });

                const fallback = unit.ids
                    .map(id => personBaseX.get(id) ?? (canvasWidth / 2) + idx * 8)
                    .reduce((sum, value) => sum + value, 0) / Math.max(unit.ids.length, 1);

                const parentAnchor = parentAnchors.length
                    ? parentAnchors.reduce((sum, value) => sum + value, 0) / parentAnchors.length
                    : null;

                const anchor = parentAnchor !== null
                    ? parentAnchor * 0.82 + groupAnchor * 0.18
                    : fallback * 0.24 + groupAnchor * 0.76;

                return {
                    unit,
                    groupId,
                    groupAnchor,
                    anchor,
                    width: unit.type === 'spouse-cluster'
                        ? Math.max(coupleWidth, singleWidth + (unit.ids.length - 1) * spouseSpacing)
                        : singleWidth
                };
            });

            entries.sort((a, b) => {
                if (a.groupAnchor !== b.groupAnchor) return a.groupAnchor - b.groupAnchor;
                if (a.anchor !== b.anchor) return a.anchor - b.anchor;
                return a.unit.key.localeCompare(b.unit.key);
            });

            const y = topMargin + depth * verticalSpacing;
            const groupBuckets = new Map();
            entries.forEach(entry => {
                if (!groupBuckets.has(entry.groupId)) groupBuckets.set(entry.groupId, []);
                groupBuckets.get(entry.groupId).push(entry);
            });

            const orderedGroups = Array.from(groupBuckets.keys()).sort((a, b) => {
                return (groupAnchors.get(a) ?? canvasWidth / 2) - (groupAnchors.get(b) ?? canvasWidth / 2);
            });

            let cursorX = 200;
            orderedGroups.forEach(groupId => {
                const bucket = groupBuckets.get(groupId);
                bucket.sort((a, b) => a.anchor - b.anchor);
                const anchor = groupAnchors.get(groupId) ?? (canvasWidth / 2);
                const totalWidth = bucket.reduce((sum, entry) => sum + entry.width, 0) + (Math.max(bucket.length - 1, 0) * unitGap);
                const centeredStart = anchor - (totalWidth / 2);
                const startX = Math.max(centeredStart, cursorX);
                let nextX = startX;
                bucket.forEach(entry => {
                    const centerX = nextX + (entry.width / 2);
                    placeUnit(entry.unit, centerX, y, spouseSpacing, assignedCenterX);
                    nextX += entry.width + unitGap;
                });
                cursorX = nextX + groupGap;
            });
        });

        normalizeLayoutBounds(defaultLayout);

        peopleMap.clear();
        data.people.forEach((person, index) => {
            const fallbackX = Number.isFinite(person.x) ? person.x : 400 + (index % 12) * 240;
            const fallbackY = Number.isFinite(person.y) ? person.y : 300 + Math.floor(index / 12) * 240;
            const layout = defaultLayout[person.id] || { x: fallbackX, y: fallbackY };
            peopleMap.set(person.id, { ...person, x: layout.x, y: layout.y });
        });
    }

    function buildSpouseIndex() {
        const spouseByPerson = new Map();
        data.links.forEach(link => {
            if (link.type !== 'spouse') return;
            if (!spouseByPerson.has(link.from)) spouseByPerson.set(link.from, new Set());
            if (!spouseByPerson.has(link.to)) spouseByPerson.set(link.to, new Set());
            spouseByPerson.get(link.from).add(link.to);
            spouseByPerson.get(link.to).add(link.from);
        });
        return spouseByPerson;
    }

    function buildParentIndex() {
        const parentsByChild = new Map();
        data.links.forEach(link => {
            if (link.type !== 'parent') return;
            if (!parentsByChild.has(link.to)) parentsByChild.set(link.to, []);
            const list = parentsByChild.get(link.to);
            if (!list.includes(link.from)) list.push(link.from);
        });
        return parentsByChild;
    }

    function buildChildIndex() {
        const childrenByParent = new Map();
        data.links.forEach(link => {
            if (link.type !== 'parent') return;
            if (!childrenByParent.has(link.from)) childrenByParent.set(link.from, []);
            const list = childrenByParent.get(link.from);
            if (!list.includes(link.to)) list.push(link.to);
        });
        return childrenByParent;
    }

    function buildDepthUnits(ids, spouseByPerson, personBaseX) {
        const idSet = new Set(ids);
        const visited = new Set();
        const sortedIds = [...ids].sort((a, b) => (personBaseX.get(a) ?? 0) - (personBaseX.get(b) ?? 0));
        const units = [];

        sortedIds.forEach(id => {
            if (visited.has(id)) return;
            const stack = [id];
            const component = [];

            while (stack.length > 0) {
                const current = stack.pop();
                if (visited.has(current)) continue;
                visited.add(current);
                component.push(current);
                const spouses = spouseByPerson.get(current) || new Set();
                spouses.forEach(spouseId => {
                    if (idSet.has(spouseId) && !visited.has(spouseId)) stack.push(spouseId);
                });
            }

            if (component.length > 1) {
                const ordered = component.sort((a, b) => (personBaseX.get(a) ?? 0) - (personBaseX.get(b) ?? 0));
                units.push({
                    type: 'spouse-cluster',
                    ids: ordered,
                    key: ordered.join('::')
                });
            } else {
                units.push({
                    type: 'single',
                    ids: [id],
                    key: id
                });
            }
        });

        return units;
    }

    function placeUnit(unit, centerX, y, spouseSpacing, assignedCenterX) {
        if (unit.type === 'spouse-cluster') {
            const span = (unit.ids.length - 1) * spouseSpacing;
            const startX = centerX - (span / 2);
            unit.ids.forEach((id, index) => {
                const x = startX + index * spouseSpacing;
                defaultLayout[id] = { x, y };
                assignedCenterX.set(id, x);
            });
            return;
        }
        const personId = unit.ids[0];
        defaultLayout[personId] = { x: centerX, y };
        assignedCenterX.set(personId, centerX);
    }

    function dominantGroupId(ids) {
        const counts = new Map();
        ids.forEach(id => {
            const groupId = groupByPerson.get(id) || 'core';
            counts.set(groupId, (counts.get(groupId) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || 'core';
    }

    function areSpousePair(idA, idB, spouseByPerson) {
        return Boolean(spouseByPerson.get(idA)?.has(idB) || spouseByPerson.get(idB)?.has(idA));
    }

    function normalizeLayoutBounds(layout) {
        const points = Object.values(layout);
        if (!points.length) return;
        const minTargetX = 210;
        const maxTargetX = canvasWidth - 210;
        const minTargetY = 230;
        const maxTargetY = canvasHeight - 240;

        const minX = Math.min(...points.map(point => point.x));
        const maxX = Math.max(...points.map(point => point.x));
        const minY = Math.min(...points.map(point => point.y));
        const maxY = Math.max(...points.map(point => point.y));

        const width = Math.max(maxX - minX, 1);
        const height = Math.max(maxY - minY, 1);
        const scaleX = Math.min(1, (maxTargetX - minTargetX) / width);
        const scaleY = Math.min(1, (maxTargetY - minTargetY) / height);

        Object.keys(layout).forEach(id => {
            const point = layout[id];
            point.x = ((point.x - minX) * scaleX) + minTargetX;
            point.y = ((point.y - minY) * scaleY) + minTargetY;
        });
    }

    function renderNodes() {
        nodesLayer.innerHTML = '';
        cardMap.clear();
        hiddenBranchIds = computeHiddenBranchIds();

        let index = 0;
        peopleMap.forEach(person => {
            const card = document.createElement('article');
            card.className = `person-card${person.id === data.rootId ? ' self' : ''}`;
            card.dataset.personId = person.id;
            if (person.id === selectedPersonId) card.classList.add('selected');
            if (hiddenBranchIds.has(person.id)) card.classList.add('hidden-branch');
            const palette = personColorMap.get(person.id);
            if (palette) {
                card.style.setProperty('--group-color-start', palette.start);
                card.style.setProperty('--group-color-end', palette.end);
                card.style.setProperty('--group-color-border', palette.border);
            }
            const coupleIds = coupleMeta.byPerson.get(person.id) || [];
            const primaryCouple = coupleIds.length ? coupleMeta.byId.get(coupleIds[0]) : null;
            const coupleColor = primaryCouple?.color;
            if (coupleColor) {
                card.classList.add('has-couple');
                card.style.setProperty('--couple-color', coupleColor);
            }
            card.style.setProperty('--entry-delay', `${index * 20}ms`);
            applyCardPosition(card, person);
            enableCardDragging(card, person);
            card.addEventListener('click', () => selectPerson(person.id));
            cardMap.set(person.id, card);

            if (person.photo) {
                const image = document.createElement('img');
                image.className = 'person-photo';
                image.src = person.photo;
                image.alt = `${person.name} photo`;
                image.loading = 'lazy';
                image.draggable = false;
                image.onerror = () => image.replaceWith(buildFallbackAvatar(person.name));
                card.appendChild(image);
            } else {
                card.appendChild(buildFallbackAvatar(person.name));
            }

            const name = document.createElement('h2');
            name.className = 'person-name';
            name.textContent = person.name;
            card.appendChild(name);

            const relation = document.createElement('p');
            relation.className = 'person-relation';
            relation.textContent = person.relation || '';
            card.appendChild(relation);

            const metaText = buildMetaText(person);
            if (metaText) {
                const meta = document.createElement('p');
                meta.className = 'person-meta';
                meta.textContent = metaText;
                card.appendChild(meta);
            }

            if (coupleIds.length > 0) {
                const badge = document.createElement('span');
                badge.className = 'couple-badge';
                badge.textContent = coupleIds.length === 1 ? `❤ ${coupleIds[0]}` : `❤ x${coupleIds.length}`;
                badge.title = coupleIds.length === 1
                    ? `Couple ${coupleIds[0]}`
                    : `Multiple couples: ${coupleIds.join(', ')}`;
                card.appendChild(badge);
            }

            nodesLayer.appendChild(card);
            index += 1;
        });
    }

    function buildFallbackAvatar(name) {
        const fallback = document.createElement('div');
        fallback.className = 'person-photo-fallback';
        fallback.textContent = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
        fallback.setAttribute('aria-label', `${name} initials avatar`);
        return fallback;
    }

    function renderLinks() {
        linkRenderFrame = null;
        hideConnectorTooltip();
        clearLinkFocus();
        hiddenBranchIds = computeHiddenBranchIds();
        linesSvg.innerHTML = '';
        linesSvg.appendChild(buildArrowMarkers());

        for (const link of data.links) {
            const from = peopleMap.get(link.from);
            const to = peopleMap.get(link.to);
            if (!from || !to) continue;
            if (hiddenBranchIds.has(from.id) || hiddenBranchIds.has(to.id)) continue;

            const dx = Math.abs(to.x - from.x);
            const curveStrength = Math.max(45, Math.min(190, Math.round(dx * 0.28)));
            const control1X = from.x < to.x ? from.x + curveStrength : from.x - curveStrength;
            const control2X = from.x < to.x ? to.x - curveStrength : to.x + curveStrength;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const variantClass = normalizeText(link.variant || '');
            path.setAttribute('class', `tree-link ${link.type || ''} ${variantClass}`.trim());
            path.setAttribute('d', `M ${from.x} ${from.y} C ${control1X} ${from.y}, ${control2X} ${to.y}, ${to.x} ${to.y}`);
            path.dataset.relationship = link.type || 'relation';
            if (variantClass) path.dataset.variant = variantClass;
            path.style.pointerEvents = 'visibleStroke';
            let coupleId = null;
            if (link.type === 'spouse') {
                const couple = getPrimaryCoupleForLink(link.from, link.to);
                const coupleColor = coupleMeta.byLinkKey.get(getLinkKey(link.from, link.to));
                if (couple) {
                    coupleId = couple.id;
                }
                if (coupleColor) path.style.stroke = coupleColor;
            }
            const description = describeLink(from, to, link.type, coupleId, variantClass);
            path.addEventListener('pointerenter', event => {
                showConnectorTooltip(description, event.clientX, event.clientY);
                focusLinkedCards(from.id, to.id, path);
            });
            path.addEventListener('pointermove', event => moveConnectorTooltip(event.clientX, event.clientY));
            path.addEventListener('pointerleave', clearConnectorHoverState);
            path.addEventListener('pointercancel', clearConnectorHoverState);
            const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            tooltip.textContent = description;
            path.appendChild(tooltip);
            linesSvg.appendChild(path);
        }
    }

    function showConnectorTooltip(text, clientX, clientY) {
        connectorTooltip.textContent = text;
        connectorTooltip.classList.add('visible');
        moveConnectorTooltip(clientX, clientY);
    }

    function moveConnectorTooltip(clientX, clientY) {
        if (!connectorTooltip.classList.contains('visible')) return;
        const offsetX = 14;
        const offsetY = 14;
        const maxLeft = Math.max(8, window.innerWidth - connectorTooltip.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - connectorTooltip.offsetHeight - 8);
        const nextLeft = Math.min(maxLeft, Math.max(8, clientX + offsetX));
        const nextTop = Math.min(maxTop, Math.max(8, clientY + offsetY));
        connectorTooltip.style.left = `${nextLeft}px`;
        connectorTooltip.style.top = `${nextTop}px`;
    }

    function hideConnectorTooltip() {
        connectorTooltip.classList.remove('visible');
    }

    function clearConnectorHoverState() {
        hideConnectorTooltip();
        clearLinkFocus();
    }

    function focusLinkedCards(fromId, toId, path) {
        clearLinkFocus();
        activeLinkPath = path;
        path.classList.add('link-focus');
        cardMap.forEach((card, personId) => {
            const isFocused = personId === fromId || personId === toId;
            card.classList.toggle('link-focus', isFocused);
            card.classList.toggle('link-dim', !isFocused);
        });
    }

    function clearLinkFocus() {
        if (activeLinkPath) {
            activeLinkPath.classList.remove('link-focus');
            activeLinkPath = null;
        }
        cardMap.forEach(card => {
            card.classList.remove('link-focus', 'link-dim');
        });
    }

    function describeLink(from, to, type, coupleId = null, variant = '') {
        const relationType = type || 'relation';
        const variantText = variant ? ` (${variant})` : '';
        if (relationType === 'parent') {
            const parentRole = inferParentRole(from);
            if (parentRole !== 'parent') {
                return `${from.name} is ${possessive(to.name)} ${parentRole}${variantText}.`;
            }
            const childRole = inferChildRole(to);
            if (childRole !== 'child') {
                return `${to.name} is ${possessive(from.name)} ${childRole}${variantText}.`;
            }
            return `${from.name} is ${possessive(to.name)} parent${variantText}.`;
        }
        if (relationType === 'spouse') {
            return coupleId
                ? `${from.name} and ${to.name} are spouses${variantText} (Couple ${coupleId}).`
                : `${from.name} and ${to.name} are spouses${variantText}.`;
        }
        if (relationType === 'sibling') {
            return `${from.name} and ${to.name} are siblings${variantText}.`;
        }
        if (relationType === 'twin') {
            return `${from.name} and ${to.name} are twins${variantText}.`;
        }
        if (relationType === 'cousin') {
            return `${from.name} and ${to.name} are cousins${variantText}.`;
        }
        return `${from.name} is related to ${to.name}${variantText}.`;
    }

    function buildMetaText(person) {
        const parts = [];
        if (person.birthYear) parts.push(`b. ${person.birthYear}`);
        if (person.deathYear) parts.push(`d. ${person.deathYear}`);
        const gender = normalizeText(person.gender || '');
        if (gender === 'male') parts.push('♂');
        if (gender === 'female') parts.push('♀');
        if (gender === 'other') parts.push('⚧');
        return parts.join(' · ');
    }

    function selectPerson(personId) {
        selectedPersonId = personId;
        cardMap.forEach((card, id) => card.classList.toggle('selected', id === personId));
        updateCollapseButtonLabel();
    }

    function toggleCollapseSelectedBranch() {
        if (!selectedPersonId) return;
        if (collapsedRoots.has(selectedPersonId)) {
            collapsedRoots.delete(selectedPersonId);
            setSearchStatus(`Expanded ${peopleMap.get(selectedPersonId)?.name || 'branch'}.`);
        } else {
            collapsedRoots.add(selectedPersonId);
            setSearchStatus(`Collapsed descendants of ${peopleMap.get(selectedPersonId)?.name || 'selected person'}.`);
        }
        renderNodes();
        renderLinks();
        updateCollapseButtonLabel();
    }

    function expandAllBranches() {
        collapsedRoots.clear();
        setSearchStatus('Expanded all branches.');
        renderNodes();
        renderLinks();
        updateCollapseButtonLabel();
    }

    function computeHiddenBranchIds() {
        const hidden = new Set();
        collapsedRoots.forEach(rootId => {
            const descendants = getDescendants(rootId);
            descendants.forEach(id => hidden.add(id));
        });
        return hidden;
    }

    function getDescendants(rootId) {
        const visited = new Set();
        const queue = [...(childIndex.get(rootId) || [])];
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            (childIndex.get(current) || []).forEach(next => {
                if (!visited.has(next)) queue.push(next);
            });
        }
        return visited;
    }

    function updateCollapseButtonLabel() {
        if (!collapseBranchBtn) return;
        const selectedName = peopleMap.get(selectedPersonId)?.name || 'Selected';
        const isCollapsed = collapsedRoots.has(selectedPersonId);
        collapseBranchBtn.textContent = isCollapsed ? `Expand ${selectedName}` : `Collapse ${selectedName}`;
    }

    function possessive(name) {
        if (!name) return '';
        return name.endsWith('s') ? `${name}'` : `${name}'s`;
    }

    function inferParentRole(person) {
        const gender = inferGender(person);
        if (gender === 'male') return 'father';
        if (gender === 'female') return 'mother';
        return 'parent';
    }

    function inferChildRole(person) {
        const gender = inferGender(person);
        if (gender === 'male') return 'son';
        if (gender === 'female') return 'daughter';
        return 'child';
    }

    function inferGender(person) {
        const text = normalizeText(`${person?.relation || ''} ${person?.notes || ''}`);
        const maleHints = [' father', ' husband', ' son', ' brother', ' grandfather', ' grandpa', ' uncle', ' male', ' elder brother', ' younger brother'];
        const femaleHints = [' mother', ' wife', ' daughter', ' sister', ' grandmother', ' grandma', ' aunt', ' female', ' elder sister', ' younger sister'];
        if (maleHints.some(hint => text.includes(hint.trim()))) return 'male';
        if (femaleHints.some(hint => text.includes(hint.trim()))) return 'female';
        return 'unknown';
    }

    function buildArrowMarkers() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(createMarker('arrowhead-parent'));
        defs.appendChild(createMarker('arrowhead-spouse'));
        defs.appendChild(createMarker('arrowhead-cousin'));
        defs.appendChild(createMarker('arrowhead-sibling'));
        defs.appendChild(createMarker('arrowhead-twin'));
        return defs;
    }

    function createMarker(id) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '8');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('orient', 'auto-start-reverse');
        marker.setAttribute('markerUnits', 'strokeWidth');

        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M 0 1 L 10 5 L 0 9 z');
        arrowPath.setAttribute('fill', 'context-stroke');
        marker.appendChild(arrowPath);
        return marker;
    }

    function scheduleRenderLinks() {
        if (linkRenderFrame !== null) return;
        linkRenderFrame = window.requestAnimationFrame(renderLinks);
    }

    function centerOnPerson(personId, behavior = 'smooth') {
        const target = peopleMap.get(personId);
        if (!target) return;
        viewport.scrollTo({
            left: target.x * zoomScale - (viewport.clientWidth / 2),
            top: target.y * zoomScale - (viewport.clientHeight / 2),
            behavior
        });
    }

    function applyCardPosition(card, person) {
        card.style.left = `${person.x}px`;
        card.style.top = `${person.y}px`;
    }

    function clampPosition(person) {
        person.x = Math.min(Math.max(person.x, cardHalfWidth), canvasWidth - cardHalfWidth);
        person.y = Math.min(Math.max(person.y, cardHalfHeight), canvasHeight - cardHalfHeight);
    }

    function enableCardDragging(card, person) {
        let isDragging = false;
        let startClientX = 0;
        let startClientY = 0;
        let startX = 0;
        let startY = 0;
        let dragPointerId = null;

        card.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            isDragging = true;
            dragPointerId = event.pointerId;
            startClientX = event.clientX;
            startClientY = event.clientY;
            startX = person.x;
            startY = person.y;
            card.classList.add('dragging');
            card.style.zIndex = '8';
            if (typeof card.setPointerCapture === 'function') {
                card.setPointerCapture(dragPointerId);
            }
            event.preventDefault();
        });

        card.addEventListener('pointermove', event => {
            if (!isDragging || event.pointerId !== dragPointerId) return;
            const deltaX = (event.clientX - startClientX) / zoomScale;
            const deltaY = (event.clientY - startClientY) / zoomScale;
            person.x = startX + deltaX;
            person.y = startY + deltaY;
            clampPosition(person);
            applyCardPosition(card, person);
            scheduleRenderLinks();
        });

        function stopDragging(event) {
            if (!isDragging || event.pointerId !== dragPointerId) return;
            isDragging = false;
            card.classList.remove('dragging');
            card.style.zIndex = '';
            if (typeof card.releasePointerCapture === 'function') {
                card.releasePointerCapture(dragPointerId);
            }
            dragPointerId = null;
            saveLayout();
            scheduleRenderLinks();
        }

        card.addEventListener('pointerup', stopDragging);
        card.addEventListener('pointercancel', stopDragging);
    }

    function loadSavedLayout() {
        const savedText = localStorage.getItem(layoutStorageKey);
        if (!savedText) return;
        try {
            const savedLayout = JSON.parse(savedText);
            peopleMap.forEach(person => {
                const saved = savedLayout?.[person.id];
                if (!saved) return;
                if (Number.isFinite(saved.x)) person.x = saved.x;
                if (Number.isFinite(saved.y)) person.y = saved.y;
                clampPosition(person);
            });
        } catch (error) {
            console.warn('Invalid saved family tree layout. Resetting stored positions.', error);
            localStorage.removeItem(layoutStorageKey);
        }
    }

    function saveLayout() {
        const layout = {};
        peopleMap.forEach(person => {
            layout[person.id] = { x: Math.round(person.x), y: Math.round(person.y) };
        });
        localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
    }

    function reorganiseToDefaultLayout() {
        peopleMap.forEach(person => {
            const defaults = defaultLayout[person.id];
            if (!defaults) return;
            person.x = defaults.x;
            person.y = defaults.y;
            clampPosition(person);
            const card = cardMap.get(person.id);
            if (!card) return;
            card.classList.add('reorganizing');
            applyCardPosition(card, person);
            window.setTimeout(() => card.classList.remove('reorganizing'), 420);
        });
        localStorage.removeItem(layoutStorageKey);
        clearSearchFocus();
        setSearchStatus('Layout reset.');
        scheduleRenderLinks();
    }

    function clearSearchFocus() {
        cardMap.forEach(card => card.classList.remove('search-focus'));
        if (searchFocusTimer) {
            window.clearTimeout(searchFocusTimer);
            searchFocusTimer = null;
        }
    }

    function setSearchStatus(text) {
        if (searchStatus) searchStatus.textContent = text;
    }

    function normalizeText(value) {
        return (value || '').toLowerCase().trim();
    }

    function findPersonByQuery(rawQuery) {
        const query = normalizeText(rawQuery);
        if (!query) return null;

        const exact = [];
        const starts = [];
        const contains = [];
        peopleMap.forEach(person => {
            const name = normalizeText(person.name);
            const relation = normalizeText(person.relation);
            const notes = normalizeText(person.notes);
            const tags = Array.isArray(person.tags) ? person.tags.map(normalizeText).join(' ') : '';
            const combined = `${name} ${relation} ${notes} ${tags}`.trim();

            if (name === query) exact.push(person);
            else if (name.startsWith(query)) starts.push(person);
            else if (combined.includes(query)) contains.push(person);
        });
        return exact[0] || starts[0] || contains[0] || null;
    }

    function focusPerson(person) {
        clearSearchFocus();
        selectPerson(person.id);
        centerOnPerson(person.id, 'smooth');
        const card = cardMap.get(person.id);
        if (!card) return;
        card.classList.add('search-focus');
        searchFocusTimer = window.setTimeout(() => {
            card.classList.remove('search-focus');
        }, 2500);
    }

    function handleSearch() {
        const query = searchInput?.value || '';
        if (!query.trim()) {
            setSearchStatus('Enter a name or relation to search.');
            return;
        }
        const person = findPersonByQuery(query);
        if (!person) {
            setSearchStatus(`No member found for "${query.trim()}".`);
            clearSearchFocus();
            return;
        }
        focusPerson(person);
        setSearchStatus(`Showing ${person.name} (${person.relation}).`);
    }

    function getThemeState() {
        const isBW = localStorage.getItem('bwMode') === 'true';
        if (isBW) return 'bw';
        return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTreeTheme(themeState) {
        document.body.dataset.theme = themeState;
        if (!treeThemeToggle) return;
        if (themeState === 'dark') {
            treeThemeToggle.textContent = '🌙 Dark';
            treeThemeToggle.title = 'Switch to Light Theme';
            treeThemeToggle.classList.remove('theme-on-light');
            treeThemeToggle.disabled = false;
            return;
        }
        if (themeState === 'light') {
            treeThemeToggle.textContent = '☀️ Light';
            treeThemeToggle.title = 'Switch to Dark Theme';
            treeThemeToggle.classList.add('theme-on-light');
            treeThemeToggle.disabled = false;
            return;
        }
        treeThemeToggle.textContent = '◐ B&W';
        treeThemeToggle.title = 'B&W mode is controlled from the main page';
        treeThemeToggle.classList.remove('theme-on-light');
        treeThemeToggle.disabled = true;
    }

    function toggleTreeTheme() {
        const currentTheme = getThemeState();
        if (currentTheme === 'bw') return;
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        applyTreeTheme(nextTheme);
    }

    function applyZoom(nextScale, anchorClientX = null, anchorClientY = null, smooth = true) {
        const clamped = Math.min(zoomMax, Math.max(zoomMin, nextScale));
        const rect = viewport.getBoundingClientRect();
        const offsetX = anchorClientX !== null ? anchorClientX - rect.left : rect.width / 2;
        const offsetY = anchorClientY !== null ? anchorClientY - rect.top : rect.height / 2;
        const worldX = (viewport.scrollLeft + offsetX) / zoomScale;
        const worldY = (viewport.scrollTop + offsetY) / zoomScale;

        zoomScale = clamped;
        stage.style.width = `${canvasWidth * zoomScale}px`;
        stage.style.height = `${canvasHeight * zoomScale}px`;
        canvas.style.transformOrigin = 'top left';
        canvas.style.transform = `scale(${zoomScale})`;

        viewport.scrollTo({
            left: worldX * zoomScale - offsetX,
            top: worldY * zoomScale - offsetY,
            behavior: smooth ? 'smooth' : 'auto'
        });

        if (zoomInBtn) zoomInBtn.disabled = zoomScale >= zoomMax;
        if (zoomOutBtn) zoomOutBtn.disabled = zoomScale <= zoomMin;
    }

    function onWheelZoom(event) {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const delta = event.deltaY < 0 ? zoomStep : -zoomStep;
        applyZoom(zoomScale + delta, event.clientX, event.clientY, false);
    }

    function onViewportPointerDown(event) {
        if (event.pointerType !== 'touch') return;
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (activePointers.size === 2) {
            const pointers = Array.from(activePointers.values());
            pinchStartDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
            pinchStartScale = zoomScale;
        }
    }

    function onViewportPointerMove(event) {
        if (event.pointerType !== 'touch' || !activePointers.has(event.pointerId)) return;
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (activePointers.size !== 2 || !pinchStartDistance) return;
        const pointers = Array.from(activePointers.values());
        const currentDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
        if (currentDistance <= 0) return;
        const midpointX = (pointers[0].x + pointers[1].x) / 2;
        const midpointY = (pointers[0].y + pointers[1].y) / 2;
        const targetScale = pinchStartScale * (currentDistance / pinchStartDistance);
        applyZoom(targetScale, midpointX, midpointY, false);
    }

    function onViewportPointerUp(event) {
        if (event.pointerType !== 'touch') return;
        activePointers.delete(event.pointerId);
        if (activePointers.size < 2) pinchStartDistance = null;
    }
})();
