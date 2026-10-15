# Wayfold original-idea walkthrough

Open [the mock gallery](index.html). Start at **Home / default**, then follow Create account to **Sign-up / success**. Go to **Member / own** to see Tendai's garage and open **Add a car**. From the garage choose **Sell this car**, which opens the pre-filled private listing form. The private seller journey continues through **Vehicles / default** to **Vehicle detail / private**.

For the recommendation journey, open **Providers / default**, **Provider / default** for Danforth Auto Care, and the **Recommend / default** dialog. The recommendation is visible on **Member / recommendations**, the provider page and **Home / feed**. **Products / default** and **Recommend / product** show the separate product recommendation path. **Provider / dealer** shows inventory; **Provider / financing** shows checked credentials and an answer to a public deal question.

The signed-out pages are Home / default, Vehicles / default, Products / default, Provider / dealer and Vehicle detail / default. Church affiliation appears only in signed-in member, feed, private listing and provider examples. The mock files are static snapshots; the requirements define access control for the application.

## Requirements traceability

| L1 | Detailed requirements |
|---|---|
| L1-001 Accounts | L2-001–003 |
| L1-002 Church trust signal | L2-022–023 |
| L1-003 Marketplace | L2-006–009, L2-034–035 |
| L1-004 Auto community | L2-010–013, L2-039 |
| L1-005 GTA focus | L2-014 |
| L1-006 Responsive | L2-015 |
| L1-007 Accessibility | L2-016 |
| L1-008 Security and privacy | L2-017–019 |
| L1-009 Performance and reliability | L2-020–021 |
| L1-010 Garage | L2-024–025 |
| L1-011 Recommendations | L2-026–029 |
| L1-012 Providers | L2-030–033 |
| L1-013 Deal guidance | L2-036–038 |

The former church approval and content requirements were removed without renumbering. The mock manifest maps each screen to the L2 requirements it illustrates; L2-018–020 are server-side or operational constraints without a dedicated screen.
