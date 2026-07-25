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
    const layoutStorageKey = 'familyTree.layout.v2';
    const connectorTooltip = document.createElement('div');

    if (!viewport || !stage || !canvas || !linesSvg || !nodesLayer) return;

    const canvasWidth = data.canvas?.width || 6200;
    const canvasHeight = data.canvas?.height || 3600;
    const cardHalfWidth = 94;
    const cardHalfHeight = 84;
    const minGapX = 212;
    const minGapY = 182;
    let linkRenderFrame = null;
    let searchFocusTimer = null;
    let activeLinkPath = null;

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
    buildClusteredLayout();
    loadSavedLayout();
    resolveCollisions(16);
    renderNodes();
    renderLinks();
    applyZoom(1, null, null, false);
    applyTreeTheme(getThemeState());
    centerOnPerson(data.rootId, 'auto');
    setSearchStatus('Tip: search by name or relation.');

    recenterBtn?.addEventListener('click', () => centerOnPerson(data.rootId, 'smooth'));
    reorganiseBtn?.addEventListener('click', () => {
        reorganiseToDefaultLayout();
        centerOnPerson(data.rootId, 'smooth');
    });
    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keydown', event => {
        if (event.key === 'Enter') handleSearch();
    });
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
        zoomOut: () => applyZoom(zoomScale - zoomStep)
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

        data.people.forEach(person => {
            const groupId = groupByPerson.get(person.id) || 'core';
            const palette = groupColorMap.get(groupId);
            if (palette) map.set(person.id, palette);
        });

        data.links.forEach(link => {
            if (link.type !== 'spouse') return;
            const sharedPalette = map.get(link.from) || map.get(link.to);
            if (!sharedPalette) return;
            map.set(link.from, sharedPalette);
            map.set(link.to, sharedPalette);
        });

        return map;
    }

    function buildCoupleMetadata() {
        const byPerson = new Map();
        const byLinkKey = new Map();
        const spouseLinks = data.links.filter(link => link.type === 'spouse');
        let coupleIndex = 1;

        spouseLinks.forEach(link => {
            const existing = byPerson.get(link.from) || byPerson.get(link.to);
            const partnerPalette = personColorMap.get(link.from) || personColorMap.get(link.to);
            const color = partnerPalette?.border || '#9a8fb8';
            const couple = existing || { id: `C${coupleIndex}`, color };
            if (!existing) coupleIndex += 1;
            byPerson.set(link.from, couple);
            byPerson.set(link.to, couple);
            byLinkKey.set(getLinkKey(link.from, link.to), couple.color);
        });

        return { byPerson, byLinkKey };
    }

    function getLinkKey(personA, personB) {
        return [personA, personB].sort((a, b) => a.localeCompare(b)).join('::');
    }

    function buildClusteredLayout() {
        const sameDepthTypes = new Set(['spouse', 'sibling', 'twin', 'cousin']);
        const depths = new Map();
        depths.set(data.rootId, 0);

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
        const assignedX = new Map();

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
        const verticalSpacing = 295;
        const topMargin = 300;
        const horizontalSpacing = 226;
        const spouseSpacing = 142;
        const groupGap = 118;

        sortedDepths.forEach(depth => {
            const ids = groupedByDepth.get(depth);
            const entries = ids.map((id, idx) => {
                const groupId = groupByPerson.get(id) || 'core';
                const groupAnchor = groupAnchors.get(groupId) ?? (canvasWidth / 2);
                const parentLinks = data.links.filter(link => link.type === 'parent' && link.to === id);
                const parentAnchors = parentLinks
                    .map(link => assignedX.get(link.from))
                    .filter(value => Number.isFinite(value));
                const fallback = data.people.find(person => person.id === id)?.x ?? (canvasWidth / 2) + idx * 12;
                const anchor = parentAnchors.length
                    ? (parentAnchors.reduce((sum, value) => sum + value, 0) / parentAnchors.length) * 0.67 + groupAnchor * 0.33
                    : fallback * 0.25 + groupAnchor * 0.75;
                return { id, groupId, groupAnchor, anchor };
            });

            entries.sort((a, b) => {
                if (a.groupAnchor !== b.groupAnchor) return a.groupAnchor - b.groupAnchor;
                if (a.anchor !== b.anchor) return a.anchor - b.anchor;
                return a.id.localeCompare(b.id);
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
                const centeredStart = anchor - ((bucket.length - 1) * horizontalSpacing / 2);
                const startX = Math.max(centeredStart, cursorX);
                const bucketIds = bucket.map(entry => entry.id);
                bucket.forEach((entry, idx) => {
                    const x = startX + idx * horizontalSpacing;
                    assignedX.set(entry.id, x);
                    defaultLayout[entry.id] = { x, y };
                });
                enforceSpouseAdjacency(bucketIds, startX, startX + ((bucket.length - 1) * horizontalSpacing), horizontalSpacing, spouseSpacing);
                bucketIds.forEach(id => {
                    assignedX.set(id, defaultLayout[id].x);
                });
                cursorX = startX + bucket.length * horizontalSpacing + groupGap;
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

    function enforceSpouseAdjacency(ids, minX, maxX, standardGap, spouseGap) {
        if (ids.length < 2) return;
        const idSet = new Set(ids);

        data.links.forEach(link => {
            if (link.type !== 'spouse') return;
            if (!idSet.has(link.from) || !idSet.has(link.to)) return;
            const from = defaultLayout[link.from];
            const to = defaultLayout[link.to];
            if (!from || !to) return;
            const mid = (from.x + to.x) / 2;
            from.x = mid - (spouseGap / 2);
            to.x = mid + (spouseGap / 2);
        });

        data.links.forEach(link => {
            if (link.type !== 'spouse') return;
            if (!idSet.has(link.from) || !idSet.has(link.to)) return;
            const spouseA = defaultLayout[link.from];
            const spouseB = defaultLayout[link.to];
            if (!spouseA || !spouseB) return;

            const leftEdge = Math.min(spouseA.x, spouseB.x);
            const rightEdge = Math.max(spouseA.x, spouseB.x);

            ids.forEach(otherId => {
                if (otherId === link.from || otherId === link.to) return;
                const other = defaultLayout[otherId];
                if (!other) return;
                if (other.x <= leftEdge || other.x >= rightEdge) return;

                const distanceToLeft = Math.abs(other.x - leftEdge);
                const distanceToRight = Math.abs(rightEdge - other.x);
                if (distanceToLeft <= distanceToRight) {
                    other.x = leftEdge - standardGap;
                } else {
                    other.x = rightEdge + standardGap;
                }
            });
        });

        for (let loop = 0; loop < 5; loop += 1) {
            const sorted = ids
                .map(id => ({ id, x: defaultLayout[id].x }))
                .sort((a, b) => a.x - b.x);

            for (let i = 1; i < sorted.length; i += 1) {
                const leftId = sorted[i - 1].id;
                const rightId = sorted[i].id;
                const left = defaultLayout[leftId];
                const right = defaultLayout[rightId];
                const requiredGap = areSpouses(leftId, rightId) ? spouseGap : standardGap;
                if ((right.x - left.x) < requiredGap) {
                    right.x = left.x + requiredGap;
                }
            }
        }

        const values = ids.map(id => defaultLayout[id].x);
        const currentMin = Math.min(...values);
        const currentMax = Math.max(...values);
        let shift = 0;
        if (currentMin < minX) shift = minX - currentMin;
        if (currentMax + shift > maxX) shift -= (currentMax + shift - maxX);
        if (shift !== 0) {
            ids.forEach(id => {
                defaultLayout[id].x += shift;
            });
        }
    }

    function areSpouses(idA, idB) {
        return data.links.some(link =>
            link.type === 'spouse' &&
            ((link.from === idA && link.to === idB) || (link.from === idB && link.to === idA))
        );
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

    function resolveCollisions(iterations = 12) {
        const people = Array.from(peopleMap.values());
        for (let loop = 0; loop < iterations; loop += 1) {
            let changed = false;
            for (let i = 0; i < people.length; i += 1) {
                for (let j = i + 1; j < people.length; j += 1) {
                    const a = people[i];
                    const b = people[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const overlapX = minGapX - Math.abs(dx);
                    const overlapY = minGapY - Math.abs(dy);
                    if (overlapX <= 0 || overlapY <= 0) continue;
                    changed = true;
                    if (overlapX < overlapY) {
                        const pushX = overlapX / 2 + 1;
                        const directionX = dx >= 0 ? 1 : -1;
                        a.x -= pushX * directionX;
                        b.x += pushX * directionX;
                    } else {
                        const pushY = overlapY / 2 + 1;
                        const directionY = dy >= 0 ? 1 : -1;
                        a.y -= pushY * directionY;
                        b.y += pushY * directionY;
                    }
                    clampPosition(a);
                    clampPosition(b);
                }
            }
            if (!changed) break;
        }
    }

    function renderNodes() {
        nodesLayer.innerHTML = '';
        cardMap.clear();

        let index = 0;
        peopleMap.forEach(person => {
            const card = document.createElement('article');
            card.className = `person-card${person.id === data.rootId ? ' self' : ''}`;
            card.dataset.personId = person.id;
            const palette = personColorMap.get(person.id);
            if (palette) {
                card.style.setProperty('--group-color-start', palette.start);
                card.style.setProperty('--group-color-end', palette.end);
                card.style.setProperty('--group-color-border', palette.border);
            }
            const couple = coupleMeta.byPerson.get(person.id);
            if (couple) {
                card.classList.add('has-couple');
                card.style.setProperty('--couple-color', couple.color);
            }
            card.style.setProperty('--entry-delay', `${index * 20}ms`);
            applyCardPosition(card, person);
            enableCardDragging(card, person);
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

            if (couple) {
                const badge = document.createElement('span');
                badge.className = 'couple-badge';
                badge.textContent = `❤ ${couple.id}`;
                badge.title = `Couple ${couple.id}`;
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
        linesSvg.innerHTML = '';
        linesSvg.appendChild(buildArrowMarkers());

        for (const link of data.links) {
            const from = peopleMap.get(link.from);
            const to = peopleMap.get(link.to);
            if (!from || !to) continue;

            const dx = Math.abs(to.x - from.x);
            const curveStrength = Math.max(45, Math.min(190, Math.round(dx * 0.28)));
            const control1X = from.x < to.x ? from.x + curveStrength : from.x - curveStrength;
            const control2X = from.x < to.x ? to.x - curveStrength : to.x + curveStrength;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', `tree-link ${link.type || ''}`);
            path.setAttribute('d', `M ${from.x} ${from.y} C ${control1X} ${from.y}, ${control2X} ${to.y}, ${to.x} ${to.y}`);
            path.dataset.relationship = link.type || 'relation';
            path.style.pointerEvents = 'visibleStroke';
            let coupleId = null;
            if (link.type === 'spouse') {
                const couple = coupleMeta.byPerson.get(link.from) || coupleMeta.byPerson.get(link.to);
                const coupleColor = coupleMeta.byLinkKey.get(getLinkKey(link.from, link.to));
                if (couple) {
                    coupleId = couple.id;
                }
                if (coupleColor) path.style.stroke = coupleColor;
            }
            const description = describeLink(from, to, link.type, coupleId);
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

    function describeLink(from, to, type, coupleId = null) {
        const relationType = type || 'relation';
        if (relationType === 'parent') {
            const parentRole = inferParentRole(from);
            if (parentRole !== 'parent') {
                return `${from.name} is ${possessive(to.name)} ${parentRole}.`;
            }
            const childRole = inferChildRole(to);
            if (childRole !== 'child') {
                return `${to.name} is ${possessive(from.name)} ${childRole}.`;
            }
            return `${from.name} is ${possessive(to.name)} parent.`;
        }
        if (relationType === 'spouse') {
            return coupleId
                ? `${from.name} and ${to.name} are spouses (Couple ${coupleId}).`
                : `${from.name} and ${to.name} are spouses.`;
        }
        if (relationType === 'sibling') {
            return `${from.name} and ${to.name} are siblings.`;
        }
        if (relationType === 'twin') {
            return `${from.name} and ${to.name} are twins.`;
        }
        if (relationType === 'cousin') {
            return `${from.name} and ${to.name} are cousins.`;
        }
        return `${from.name} is related to ${to.name}.`;
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
