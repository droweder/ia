1. **Create Custom Delete Chat Modal:**
   - Create `src/components/DeleteChatModal.tsx` containing a custom UI modal for confirming chat deletion.
   - Use the existing design language (Tailwind CSS, `lucide-react` icons) to match other modals.

2. **Integrate Custom Delete Modal in Layout Component:**
   - In `src/components/Layout.tsx`, import `DeleteChatModal`.
   - Add state variables (`isDeleteModalOpen`, `chatToDeleteId`) to manage the modal's visibility and track which chat is being deleted.
   - Update the "Excluir" button in the chat menu to open this modal instead of calling the native browser `window.confirm()`.
   - Update the `handleDeleteChat` function to perform the actual deletion logic when confirmed via the modal, and remove the `window.confirm()` call from it.

3. **Verify and Pre-commit Steps:**
   - Run tests/linting (via `pre_commit_instructions`) and address any issues.
   - Commit the changes and submit.
