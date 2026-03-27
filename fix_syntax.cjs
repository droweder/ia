const fs = require('fs');
let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

// Instead of putting it around DeleteProjectModal, I should close the ternary right before the Modals.
// The structure is:
// <div wrapper>
//   {activeProject ? ( details ) : (
//     <>
//       {/* Header */}
//       ...
//       {/* Main Content (Grid) */}
//       ...
//     </>
//   )}
//   {/* Modals */}
// </div>

content = content.replace(
    "      ) : (\n\n      {/* Header */}",
    "      ) : (\n      <>\n      {/* Header */}"
);

content = content.replace(
    "        )} \n\n      <DeleteProjectModal\n        isOpen={isDeleteOpen}",
    "        <DeleteProjectModal\n        isOpen={isDeleteOpen}"
);

content = content.replace(
    "      {/* Modals */}",
    "      </>\n      )}\n\n      {/* Modals */}"
);

fs.writeFileSync('src/pages/Projects.tsx', content);
