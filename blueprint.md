# FeedMoney Application Blueprint

## 1. Application Overview

**FeedMoney** is a web application designed to provide users with real-time financial market data, insightful blog content, and economic news. The goal is to create a high-quality, information-rich platform for individuals interested in investing and financial markets. The application is built with vanilla HTML, CSS, and JavaScript, and it utilizes Firebase for its backend services (Firestore database) and TradingView widgets for displaying financial data.

## 2. Design and Features

### 2.1. Visual Design

*   **Layout**: A clean, modern, and responsive layout that is easy to navigate. The design uses a card-based system to present information in a structured manner.
*   **Color Palette**: A professional color scheme with a light and dark mode option to enhance user experience.
    *   Primary/Accent: Blue
    *   Secondary: Grays, with green for positive indicators (Naver) and red for negative actions (delete).
*   **Typography**: `Pretendard` for body text for readability and `Montserrat` for headings and logos to give a modern feel.
*   **Interactivity**: Smooth transitions, hover effects, and a clear visual hierarchy guide the user through the application.

### 2.2. Core Features

*   **Homepage**:
    *   A ticker tape widget displaying major market indices.
    *   A grid of mini-charts for a quick overview of key assets (indices, commodities, forex, crypto).
    *   A horizontally scrolling preview of the latest blog posts.
    *   Sections for the latest economic news and an economic calendar, powered by TradingView widgets.
*   **Blog Page**:
    *   A full grid view of all blog posts, with pagination.
    *   Content is fetched from a Firestore database.
    *   **Category Filtering**: Users can filter blog posts by categories (Macro-Economics, Crypto, Stock Market).
*   **Admin Functionality**:
    *   Password-protected admin access.
    *   Ability to add, delete, and reorder blog posts.
    *   Ability to assign a category to each blog post.
*   **Theme Toggle**: Users can switch between a light and dark theme, and the preference is saved in local storage.
*   **Static Pages**:
    *   Terms of Service
    *   Privacy Policy
    *   About Us

## 3. Technical Architecture

*   **Frontend**: Vanilla HTML, CSS, and JavaScript. ES Modules are used for Firebase integration.
*   **Backend**: Firebase (Firestore) is used as a headless CMS for blog content.
*   **Third-Party Services**:
    *   **TradingView Widgets**: Used for displaying all financial charts, news, and calendars.
    *   **Google Fonts**: For loading the `Montserrat` font.
    *   **jsDelivr CDN**: For loading the `Pretendard` font.

## 4. Current Development Plan

### Add Blog Categories

*   **Objective**: To organize blog posts into categories and allow users to filter by them.
*   **Categories**: Macro-Economics, Crypto, Stock Market.
*   **Implementation Steps**:
    1.  **Refactor Code**: Move inline CSS and JavaScript from `index.html` to separate `style.css` and `main.js` files.
    2.  **Update `index.html`**:
        *   Add a dropdown menu for category selection in the admin form.
        *   Add a filter bar or dropdown on the blog page to allow users to select a category.
    3.  **Update `main.js`**:
        *   Modify the Firestore logic to save a `category` field with each blog post.
        *   Implement the filtering logic to display posts based on the selected category.
        *   Update the `createCard` function to display the category on each blog post card.
    4.  **Update `style.css`**: Add styling for the new category filter and the category label on cards.

## 5. Plan for AdSense Approval

The following steps have been completed to improve the website's quality and align it with Google AdSense program policies.

*   **[Completed] Create `blueprint.md`**: Documenting the application's purpose, design, and features.
*   **[Completed] Enhance Content & Originality**:
    *   **Create "About Us" Page**: Added a new "About" view within `index.html` to explain the site's purpose and build user trust.
    *   **Enrich Homepage**: Added an introductory text section on the homepage to provide more original content beyond the widgets.
*   **[Completed] Improve Site Structure & SEO**:
    *   **Implement Hash-Based Routing**: Converted the JavaScript-based navigation to a hash-based routing system (e.g., `index.html#home`, `index.html#blog`, `index.html#about`).
    *   Updated the navigation links in the header and footer to use the new hash-based URLs.
    *   Modified the `showPage` function to handle URL hash changes on page load and navigation.
*   **[Completed] Refine Legal Pages**:
    *   Expanded the "Terms of Service" and "Privacy Policy" with more detailed and specific information relevant to the site's content and data handling practices.
*   **[Completed] Final Review**:
    *   Updated this `blueprint.md` file to reflect all the changes made.