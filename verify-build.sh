#!/bin/bash
# Electron Build Verification Script
# Run this before releasing to verify everything is correct

echo "=========================================="
echo "🔍 TOWER DEFENSE - BUILD VERIFICATION"
echo "=========================================="
echo ""

# Check 1: Root package.json exists
echo "✓ Check 1: Root package.json"
if [ -f "package.json" ]; then
    echo "   ✅ package.json EXISTS"
    # Check main field
    if grep -q '"main": "electron/main.js"' package.json; then
        echo "   ✅ main field correct"
    else
        echo "   ❌ main field WRONG"
    fi
    # Check files field
    if grep -q '"frontend/\*\*/\*"' package.json; then
        echo "   ✅ files includes frontend"
    else
        echo "   ❌ files field MISSING frontend"
    fi
else
    echo "   ❌ package.json MISSING!"
fi
echo ""

# Check 2: Frontend resources exist
echo "✓ Check 2: Frontend Resources"
[ -f "frontend/index.html" ] && echo "   ✅ index.html" || echo "   ❌ index.html MISSING"
[ -f "frontend/css/style.css" ] && echo "   ✅ style.css" || echo "   ❌ style.css MISSING"
[ -f "frontend/js/main.js" ] && echo "   ✅ main.js" || echo "   ❌ main.js MISSING"
[ -d "frontend/js/api" ] && echo "   ✅ api folder" || echo "   ❌ api folder MISSING"
echo ""

# Check 3: Electron files
echo "✓ Check 3: Electron Files"
[ -f "electron/main.js" ] && echo "   ✅ main.js" || echo "   ❌ main.js MISSING"
[ -f "electron/preload.js" ] && echo "   ✅ preload.js" || echo "   ❌ preload.js MISSING"
[ -f "electron/package.json" ] && echo "   ✅ package.json" || echo "   ❌ package.json MISSING"
echo ""

# Check 4: main.js has required code
echo "✓ Check 4: main.js Configuration"
if grep -q "app.isPackaged" electron/main.js; then
    echo "   ✅ Has app.isPackaged check"
else
    echo "   ❌ Missing app.isPackaged check"
fi
if grep -q "ElectronLogger" electron/main.js; then
    echo "   ✅ Has ElectronLogger"
else
    echo "   ❌ Missing ElectronLogger"
fi
if grep -q "getPaths()" electron/main.js; then
    echo "   ✅ Has getPaths function"
else
    echo "   ❌ Missing getPaths function"
fi
if grep -q "getErrorFallbackHtml" electron/main.js; then
    echo "   ✅ Has error fallback HTML"
else
    echo "   ❌ Missing error fallback HTML"
fi
echo ""

# Check 5: preload.js has error bridge
echo "✓ Check 5: preload.js Configuration"
if grep -q "electronLog" electron/preload.js; then
    echo "   ✅ Has electronLog export"
else
    echo "   ❌ Missing electronLog export"
fi
if grep -q "error event" electron/preload.js; then
    echo "   ✅ Has error event listener"
else
    echo "   ❌ Missing error event listener"
fi
echo ""

# Check 6: index.html has error UI
echo "✓ Check 6: index.html Configuration"
if grep -q "error-display" frontend/index.html; then
    echo "   ✅ Has error display UI"
else
    echo "   ❌ Missing error display UI"
fi
if grep -q "loading-screen" frontend/index.html; then
    echo "   ✅ Has loading screen"
else
    echo "   ❌ Missing loading screen"
fi
if grep -q "appErrors" frontend/index.html; then
    echo "   ✅ Has error monitoring"
else
    echo "   ❌ Missing error monitoring"
fi
echo ""

# Check 7: Documentation files exist
echo "✓ Check 7: Documentation"
[ -f "WHITE_SCREEN_FIX_REPORT.md" ] && echo "   ✅ WHITE_SCREEN_FIX_REPORT.md" || echo "   ❌ WHITE_SCREEN_FIX_REPORT.md MISSING"
[ -f "BUILD_CHECKLIST.md" ] && echo "   ✅ BUILD_CHECKLIST.md" || echo "   ❌ BUILD_CHECKLIST.md MISSING"
[ -f "PRODUCTION_BUILD_GUIDE.js" ] && echo "   ✅ PRODUCTION_BUILD_GUIDE.js" || echo "   ❌ PRODUCTION_BUILD_GUIDE.js MISSING"
[ -f "DETAILED_ERROR_ANALYSIS.md" ] && echo "   ✅ DETAILED_ERROR_ANALYSIS.md" || echo "   ❌ DETAILED_ERROR_ANALYSIS.md MISSING"
echo ""

echo "=========================================="
echo "✓ Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "3. Run: npm run pack"
echo "4. Run: npm run dist:win"
echo ""
