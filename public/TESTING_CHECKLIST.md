# WarrenGami SEL Toolkit - Testing Checklist

## ✅ **Core Functionality Tests**

### 1. **Authentication & Global Header**
- [ ] Login page loads correctly
- [ ] Authentication works with valid credentials
- [ ] Global header appears on all protected pages
- [ ] Global header shows correct user info (School, Tier)
- [ ] Dashboard link in header works
- [ ] Logout button works and redirects to login
- [ ] Header is fixed at top and doesn't interfere with content

### 2. **URL Routing System**
- [ ] `toolkit.html?view=guide&page=2` redirects to Welcome page
- [ ] `toolkit.html?view=dice&type=emotions` redirects to Emotions Dice
- [ ] `toolkit.html?view=scenarios&page=1` redirects to Scenario Cards 1
- [ ] `toolkit.html?view=dice&type=blank` redirects to Blank Dice
- [ ] `toolkit.html?view=scenarios-blank` redirects to Blank Scenario Cards
- [ ] Invalid routes default to dashboard
- [ ] All dashboard links use clean URLs

### 3. **Data Persistence & User Feedback**
- [ ] Blank Dice page shows "💾 Saved!" indicator when typing
- [ ] Blank Dice content persists after page refresh
- [ ] Blank Scenario Cards page shows "💾 Saved!" indicator when typing
- [ ] Blank Scenario Cards content persists after page refresh
- [ ] Clear buttons work and save cleared state
- [ ] Data persistence message appears on both pages
- [ ] Saved indicator appears for 2 seconds with debouncing

### 4. **Navigation & Links**
- [ ] Dashboard loads correctly
- [ ] All guide page links work (Pages 1-11)
- [ ] All dice links work (Emotions, Empathy, Friendship, etc.)
- [ ] All scenario card links work (Cards 1-5)
- [ ] Template links work (Blank Dice, Blank Scenario Cards)
- [ ] Search functionality works on dashboard
- [ ] Favorites functionality works

### 5. **Print Functionality**
- [ ] Print buttons work on all printable pages
- [ ] Print layout hides navigation and controls
- [ ] Print layout shows content properly
- [ ] Blank Dice prints correctly
- [ ] Blank Scenario Cards print correctly

## ✅ **Cross-Browser Compatibility**

### 6. **Browser Testing**
- [ ] Chrome - All functionality works
- [ ] Firefox - All functionality works
- [ ] Safari - All functionality works
- [ ] Edge - All functionality works
- [ ] Mobile browsers - Responsive design works

### 7. **localStorage Compatibility**
- [ ] localStorage works in all browsers
- [ ] Graceful fallback if localStorage is disabled
- [ ] Data persists across browser sessions
- [ ] No console errors related to storage

## ✅ **Performance & Security**

### 8. **Performance**
- [ ] Pages load quickly (< 3 seconds)
- [ ] No JavaScript errors in console
- [ ] Images and fonts load properly
- [ ] Smooth animations and transitions

### 9. **Security**
- [ ] Authentication tokens are properly validated
- [ ] Expired tokens are handled correctly
- [ ] No sensitive data exposed in URLs
- [ ] XSS protection for user input

## ✅ **User Experience**

### 10. **Accessibility**
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader compatibility
- [ ] Proper ARIA labels
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible

### 11. **Mobile Experience**
- [ ] Responsive design works on mobile
- [ ] Touch interactions work properly
- [ ] Text is readable on small screens
- [ ] Navigation is usable on mobile

## ✅ **Content & Functionality**

### 12. **Interactive Elements**
- [ ] Dice rolling animations work
- [ ] Card flipping animations work
- [ ] Search and filter functionality works
- [ ] Favorites system works
- [ ] All buttons and links are functional

### 13. **Content Accuracy**
- [ ] All SEL content is accurate
- [ ] Links point to correct resources
- [ ] Print layouts are complete
- [ ] No broken images or links

## ✅ **Error Handling**

### 14. **Error Scenarios**
- [ ] Invalid login credentials handled gracefully
- [ ] Network errors handled properly
- [ ] Missing files don't crash the application
- [ ] localStorage errors don't break functionality
- [ ] Invalid URLs redirect appropriately

## **Testing Instructions**

1. **Start the server**: `cd public && python3 -m http.server 8000`
2. **Open browser**: Navigate to `http://localhost:8000`
3. **Test authentication**: Login with valid credentials
4. **Test navigation**: Click through all dashboard links
5. **Test data persistence**: Edit content on Blank Dice and Blank Scenario Cards
6. **Test print functionality**: Use print buttons on various pages
7. **Test responsive design**: Resize browser window and test on mobile
8. **Test error scenarios**: Try invalid URLs and network issues

## **Known Issues to Monitor**

- Some old file-based links still exist in navigation bars (non-critical)
- CSS linter warnings in Blank Scenario Cards (non-functional)
- Navigation bars at bottom of pages (redundant with global header)

## **Success Criteria**

✅ All core functionality works without errors
✅ User experience is smooth and intuitive
✅ Data persistence works reliably
✅ Global navigation provides consistent experience
✅ Clean URLs abstract file-based navigation
✅ Professional appearance and feel 