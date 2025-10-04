%% ===================================================================================
%% Freelance Document Class File (freelance-doc.cls)
%% Version: 1.2
%%
%% Fixes indentation issue on full-page environments.
%% ===================================================================================

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{freelance-doc}[2025/07/28 v1.2 Freelance document class based on abntex2]

% --- Pass all options to the base abntex2 class
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{abntex2}}
\ProcessOptions\relax
\LoadClass{abntex2}
\usepackage{graphicx} % Ensure graphicx is loaded
\usepackage{geometry} % For page layout control

% --- NEW PACKAGES FOR CUSTOM STYLING ---
\usepackage[table]{xcolor}
\usepackage{colortbl}         % For \rowcolor and \cellcolor commands
\usepackage[most]{tcolorbox}  % Load this AFTER xcolor
\usepackage{xparse} % For advanced command redefinition
\setlength{\parindent}{1.5cm}
\usepackage{indentfirst}

%% ===================================================================================
%% CUSTOM TABLE OF CONTENTS STYLING (using memoir native commands)
%% Final working version with fixes for Bibliography and Attachments indentation.
%% ===================================================================================

% --- Define a consistent color ---
\definecolor{hyperlinkblue}{RGB}{41, 5, 195}

% --- Customize the TOC title ---
\renewcommand{\contentsname}{\color{hyperlinkblue}\bfseries Contents}

% % --- Chapter entries in TOC ---
\renewcommand{\chapternumberline}[1]{\color{hyperlinkblue}\bfseries#1\quad}
\renewcommand{\cftchapterfont}{\bfseries\color{hyperlinkblue}}
\renewcommand{\cftchapterpagefont}{\bfseries\color{black}} % Set page numbers to black

% --- Section entries in TOC ---
\renewcommand{\cftsectionfont}{\normalfont}
\renewcommand{\cftsectionpagefont}{\normalfont}

% --- Subsection entries in TOC ---
\renewcommand{\cftsubsectionfont}{\normalfont}
\renewcommand{\cftsubsectionpagefont}{\normalfont}

% --- Adjust indentations ---
\setlength{\cftchapterindent}{0pt}
\setlength{\cftsectionindent}{1.5em}
\setlength{\cftsubsectionindent}{3.0em}

% --- Adjust number widths ---
\setlength{\cftchapternumwidth}{1.5em}
\setlength{\cftsectionnumwidth}{2.3em}
\setlength{\cftsubsectionnumwidth}{3.2em}

% --- Customize the dots (leaders) ---
\renewcommand{\cftchapterdotsep}{\cftdotsep}
\renewcommand{\cftsectiondotsep}{\cftdotsep}
\renewcommand{\cftsubsectiondotsep}{\cftdotsep}

% --- Fix for numbered Referencias/Bibliography ---
\makeatletter
% Patch the bibliography command to use numbered chapters
\AtBeginDocument{%
  % Set bibliography as a numbered chapter
  \renewcommand{\bibsection}{%
    \chapter{\bibname}%
  }%
}
\makeatother

% Add this to your TOC customization section
% \newcommand{\addunnumberedchapter}[1]{%
%   \addcontentsline{toc}{chapter}{\hspace{-4.6em}\color{hyperlinkblue}\bfseries #1}%
% }

% Add this to your TOC customization section
\newcommand{\addunnumberedchapter}[2][]{%
  \ifx\relax#1\relax
    % No label provided - use default behavior
    \addcontentsline{toc}{chapter}{\hspace{-4.6em}\color{hyperlinkblue}\bfseries #2}%
  \else
    % Label provided - make it clickable
    \addcontentsline{toc}{chapter}{\hspace{-4.6em}\protect\hyperlink{#1}{\color{hyperlinkblue}\bfseries #2}}%
  \fi
}
%% ===================================================================================
%% CUSTOM STYLED SUMMARY (Resumo)
%% We redefine the 'resumo' environment to use a styled tcolorbox.
%% This ensures a consistent, modern look across all platforms.
%% ===================================================================================
% \definecolor{summary_bg}{gray}{0.95} % Light gray background for the box
% \definecolor{summary_frame}{gray}{0.85} % Border color

\definecolor{summary_bg}{gray}{0.95}     % Light gray background
% \definecolor{summary_frame}{rgb}{0.004,0.318,0.533}  % #015188 converted to RGB
% we will use #4B8F83 to summary_frame
\definecolor{summary_frame}{rgb}{0.294,0.561,0.514}  % #4B8F83 converted to RGB

\RenewDocumentEnvironment{resumo}{o}{%
  \IfNoValueF{#1}{\pdfbookmark[1]{#1}{resumo}}% Add bookmark if title exists
  \begin{tcolorbox}[
    breakable,
    colback=summary_bg,      % Background color
    colframe=summary_frame,  % Frame color
    coltitle=white,          % Title text color changed to white
    coltext=black,           % Body text color
    fonttitle=\bfseries\sffamily,     % Title font: bold sans-serif
    fontlower=\sffamily,     % Body text font: sans-serif (modern look)
    sharp corners,
    boxrule=1pt,             % Frame thickness
    left=10pt,               % "Indentation" on the left
    right=10pt,              % Padding on the right
    top=8pt,
    bottom=8pt,
    % Use the optional argument [#1] as the title of the box
    title={\IfNoValueTF{#1}{Resumo}{#1}},
  ]%
}{%
  \end{tcolorbox}%
}

%% ===================================================================================
%% NEW COMMANDS FOR FREELANCE DOCUMENTS
%% ===================================================================================
\makeatletter
% --- Command for Client Name ---
\newcommand{\cliente}[1]{\gdef\@cliente{#1}}
\newcommand{\imprimircliente}{\@cliente}

% --- Commands for Cover Page Images ---
\newcommand{\toplogo}[1]{\gdef\@toplogo{#1}}
\newcommand{\bottomlogo}[1]{\gdef\@bottomlogo{#1}}

% --- Command to print top image ---
\newcommand{\imprimirtoplogo}{%
  \abntex@ifnotempty{\@toplogo}{%
    \includegraphics[width=\paperwidth]{\@toplogo}% Updated to \paperwidth for consistency
  }%
}
% --- Command to print bottom image ---
\newcommand{\imprimirbottomlogo}{%
  \abntex@ifnotempty{\@bottomlogo}{%
     \includegraphics[width=\paperwidth]{\@bottomlogo}% Updated to \paperwidth for consistency
  }%
}
\makeatother

%% ===================================================================================
%% REDEFINED COVER PAGE (\imprimircapalogo)
%% This creates a full-page cover with top/bottom images, inspired by your reference.
%% ===================================================================================
\newcommand{\imprimircapalogo}{%
  \clearpage
  \thispagestyle{empty}%
  \newgeometry{left=0pt, right=0pt, top=0pt, bottom=0pt}%
  % \setlength{\parindent}{0pt}%
  % \setlength{\parskip}{0pt}%
  
  \noindent%
  \begin{minipage}[t][\paperheight]{\paperwidth}
    % --- Top Image ---
    \noindent{\imprimirtoplogo\par}
    
    \vfill % Pushes content to the vertical center

    % --- Main Content ---
    \begin{center}
      {\ABNTEXchapterfont\bfseries\Huge\imprimirtitulo\par} % Project Title
      \vspace{1cm}
      {\ABNTEXchapterfont\Large \imprimircliente\par} % Client
      \vspace{1cm}
      {\ABNTEXchapterfont\large\imprimirautor\par} % Developer Name
      \vspace{1cm}
      {\large\imprimirdata\par} % Date
    \end{center}

    \vfill % Pushes the bottom image to the bottom

    % --- Bottom Image ---
    \noindent{\imprimirbottomlogo\par}
  \end{minipage}
  
  \restoregeometry
  \clearpage
}

%% ===================================================================================
%% REDEFINED TITLE PAGE LAYOUT (\imprimirfolhaderosto)
%% A simplified and professional version of the academic title page.
%% ===================================================================================
\makeatletter
\renewcommand{\folhaderostocontent}{%
  \begin{center}
    % --- Developer Name ---
    {\ABNTEXchapterfont\large\imprimirautor\par}
    \vspace*{2cm}
    % --- Project Title ---
    {\ABNTEXchapterfont\bfseries\huge\imprimirtitulo\par}
    \vfill
    % --- Client Info ---
    \hspace{.45\textwidth}%
    \begin{minipage}{.5\textwidth}
      \SingleSpacing
      % \textbf{Client:} \imprimircliente
      \par\vspace{0.5cm}\par
      \textbf{Gestão financeira fácil, intuitiva e open source.}
    \end{minipage}%
    \vfill
    % --- Location and Date ---
    {\large\imprimirlocal}
    \par
    {\large\imprimirdata}
    \vspace*{1cm}
  \end{center}
}
\makeatother
%% ===================================================================================
%% CLOSING PAGE (CONTRACAPA)
%% This command generates a full-page image at the end of the document.
%% ===================================================================================
\makeatletter
% --- Command to define the closing image file path ---
\newcommand{\closingimage}[1]{\gdef\@closingimage{#1}}

% --- Command to print the closing page ---
\newcommand{\imprimirclosingpage}{%
  \cleardoublepage
  \thispagestyle{empty}%
  \newgeometry{margin=0pt}%
  
  \noindent % <-- FIX: Prevents indentation of the minipage
  \begin{minipage}[c][\paperheight]{\paperwidth}
    % --- Display the full-page closing image ---
    \abntex@ifnotempty{\@closingimage}{%
      \centering
      \includegraphics[width=\paperwidth,height=\paperheight]{\@closingimage}%
    }%
  \end{minipage}
  
  \restoregeometry
  \cleardoublepage
}
\makeatother
%% ===================================================================================
%% END OF CLASS FILE
%% ===================================================================================