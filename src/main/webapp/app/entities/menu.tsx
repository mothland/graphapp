import React from 'react';
// eslint-disable-line

import MenuItem from 'app/shared/layout/menus/menu-item'; // eslint-disable-line

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/graph">
        Graph
      </MenuItem>
      <MenuItem icon="asterisk" to="/node">
        Node
      </MenuItem>
      <MenuItem icon="asterisk" to="/edge">
        Edge
      </MenuItem>
      <MenuItem icon="asterisk" to="/comment">
        Comment
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
