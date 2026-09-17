const fs = require('fs');
let formContent = fs.readFileSync('src/components/ProjectForm.tsx', 'utf8');

// Ensure imports in ProjectForm
const extraImports = `
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Loader } from "lucide-react";
`;
if (!formContent.includes('firebase/storage')) {
    formContent = formContent.replace(
        'import { Save, Image as ImageIcon, Video, Tag, X, ChevronDown, Check, Upload, Link } from "lucide-react";',
        'import { Save, Image as ImageIcon, Video, Tag, X, ChevronDown, Check, Upload, Link, Loader } from "lucide-react";\nimport { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";\nimport { storage } from "../firebase";'
    );
}

fs.writeFileSync('src/components/ProjectForm.tsx', formContent);

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
// Fix Admin.tsx key errors by adding key? to the prop types of NavItem and ProjectCard inline
adminContent = adminContent.replace('}) => {', '  key?: any;\n}) => {'); // Might match multiple, let's be more precise

const navItemPropsSearch = `const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  disabled?: boolean,
  onClick?: () => void,
  collapsed?: boolean,
  draggable?: boolean,
  onDragStart?: any,
  onDragOver?: any,
  onDrop?: any
}) => {`;

const navItemPropsReplace = `const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  disabled?: boolean,
  onClick?: () => void,
  collapsed?: boolean,
  draggable?: boolean,
  onDragStart?: any,
  onDragOver?: any,
  onDrop?: any,
  key?: React.Key
}) => {`;
adminContent = adminContent.replace(navItemPropsSearch, navItemPropsReplace);

const projectCardPropsSearch = `const ProjectCard = ({ 
  project, 
  viewMode = 'grid', 
  isSelected = false, 
  onToggleSelect, 
  onToggleFavorite, 
  onClick,
  onActionClick
}: { 
  project: Project, 
  viewMode?: 'grid' | 'list',
  isSelected?: boolean,
  onToggleSelect?: (e: React.MouseEvent) => void,
  onToggleFavorite?: (e: React.MouseEvent) => void,
  onClick?: () => void,
  onActionClick?: (action: 'review' | 'download', project: Project) => void
}) => {`;

const projectCardPropsReplace = `const ProjectCard = ({ 
  project, 
  viewMode = 'grid', 
  isSelected = false, 
  onToggleSelect, 
  onToggleFavorite, 
  onClick,
  onActionClick
}: { 
  project: Project, 
  viewMode?: 'grid' | 'list',
  isSelected?: boolean,
  onToggleSelect?: (e: React.MouseEvent) => void,
  onToggleFavorite?: (e: React.MouseEvent) => void,
  onClick?: () => void,
  onActionClick?: (action: 'review' | 'download', project: Project) => void,
  key?: React.Key
}) => {`;
adminContent = adminContent.replace(projectCardPropsSearch, projectCardPropsReplace);

fs.writeFileSync('src/pages/Admin.tsx', adminContent);

