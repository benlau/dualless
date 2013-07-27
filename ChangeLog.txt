Release 0.4
=============

Features
 * Added auto maximize mode
  * After splitted, if one of the window close, the remaining one will be maximized to occupy all the space
 * Added bookmark support
 
Code improvement
 * Improved the coding style related to scope and two way binding.
 * No code will access sys/* except by using Angular service (WindowManager).

Release 0.3
===========

Feature Changes
 * Dualless now works with maximized window!
 * Press middle key on split window button will duplicate the current page on other window.
 * Vertical split is supported.
 * Options page is added. User may enable/disable pairing mode(MacOS simulation)
 * Ubuntu with Unity works better now

Architecture changes
 * Reorganize the source tree.
  * jquery is moved to lib
 * Rewritten most of the code by using Angular.js and Require.js
  
Release 0.2
=============

 * Supported to merge browser windows into one
 * Pairing mode is added. Focus on a splitted window will show another pair automatically. Simulate the behaviour of MacOS X.

Release 0.1.2
=============

 * Enhanced the algorithm. The split will only happen when a single browser
   window was found. If multiple window was found, it will not do split,
   just use arrange of position and size.   


Release 0.1.1
=============

 * Initial Release
 * Support to split windows by moving the current tab into a new window.
   Then change the position and size of newly created and original window
   according to the ratio specificed by user.
   
