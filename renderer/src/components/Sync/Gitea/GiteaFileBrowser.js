import React, { useContext, useEffect } from 'react';
import {
  AuthenticationContext,
  RepositoryContext,
  get,
} from 'gitea-react-toolkit';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { SyncContext } from '../SyncContextProvider';
import * as logger from '../../../logger';
import LoadingSpinner from '../LoadingSpinner';
import GridRow from '../GridRow';
import ProjectMergePop from './ProjectMerge/ProjectMergePopUp';

/* eslint-disable no-console */
// eslint-disable-next-line react/prop-types
const GiteaFileBrowser = ({ changeRepo }) => {
  const {
    states: { selectedGiteaProject, syncProgress, refreshGiteaListUI },
    action: {
      setSelectedGiteaProject,
    },
  } = useContext(SyncContext);

  const { t } = useTranslation();

  // eslint-disable-next-line no-unused-vars
  const [advacnedOption, setAdvacnedOption] = React.useState(false);
  const [projects, setProjects] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  // active step is used in adavacned sync option future
  // eslint-disable-next-line no-unused-vars
  const [activeStep, setActiveStep] = React.useState();

  const [steps, setSteps] = React.useState([]);
  const { state: auth, component: authComponent } = useContext(
    AuthenticationContext,
  );
  const { state: repo, component: repoComponent } = useContext(
    RepositoryContext,
  );

  const fetchTree = async (treeUrl, projectName) => {
    logger.debug('Dropzone.js', 'calling fetchTree event');
    const step = steps;
    const found = steps.find((s) => s.url === treeUrl && s.name === projectName);
    if (found === undefined) {
      step.push({ url: treeUrl, name: projectName });
      setActiveStep(step.length);
      setSteps(step);
    }
    const url = treeUrl;
    const tree = [];
    const blob = [];
    const response = await get({ url, config: auth.config });
    response.tree?.forEach((list) => {
      if (list.type === 'blob') {
        blob.push(list);
      }
      if (list.type === 'tree') {
        tree.push(list);
      }
    });
    logger.debug('Dropzone.js', 'sending the list of Trees and Blobs');
    setProjects(tree);
    setFiles(blob);
  };

  const handleStep = (step) => () => {
    logger.debug('Dropzone.js', 'calling handleStep event');
    steps.splice(step + 1, steps.length);
    setSteps(steps);
    setActiveStep(step + 1);
    fetchTree(steps[step].url, steps[step].name);
  };
  const cleanRepo = () => {
    logger.debug('Dropzone.js', 'calling cleanRepo to change the Repo');
    setFiles([]);
    setProjects([]);
    setSteps([]);
    changeRepo();
  };

  useEffect(() => {
    if (files.length === 0 && projects.length === 0) {
      if (repo) {
        fetchTree(`${auth.config.server}/${repo?.tree_url}`, repo.name);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo?.tree_url]);

  // Auto refresh for gitea side after upload from Ag move to context
  // React.useEffect(() => {
  //   if (updateGitea && !refreshGiteaListUI.triger) {
  //     setRefreshGiteaListUI({ ...refreshGiteaListUI, triger: true });
  //   }
  //   if (!updateGitea && refreshGiteaListUI.triger) {
  //     setRefreshGiteaListUI({ ...refreshGiteaListUI, timeOut: true });
  //     setTimeout(() => {
  //       setRefreshGiteaListUI({ ...refreshGiteaListUI, triger: false, timeOut: false });
  //     }, 500);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [updateGitea]);
  // console.log({ selectedGiteaProject });
  return (
    (!auth && authComponent)
    || (!repo && (
      <div className="grid grid-rows-2">
        <div>
          {refreshGiteaListUI.timeOut === true ? <LoadingSpinner /> : <div>{repoComponent}</div>}
        </div>
      </div>
  ))
    || (
    <>
      <div className="flex flex-row mx-5 my-3 border-b-1 border-primary">
        <span className="font-semibold" onClick={cleanRepo} role="button" tabIndex={-1}>
          {t('label-Gitea')}
          {' '}
          {t('label-project')}
        </span>
        {steps.map((label, index) => (
          (steps.length - 1 === index)
            ? (
              <span key={label} className="font-semibold tracking-wide text-primary">
                <ChevronRightIcon className="h-4 w-4 mx-2 inline-block fill-current text-gray-800" aria-hidden="true" />
                {label.name}
              </span>
            ) : (
              <span key={label} className="font-semibold" onClick={handleStep(index)} role="button" tabIndex={-1}>
                <ChevronRightIcon className="h-4 w-4 mx-2 inline-block fill-current text-gray-800" aria-hidden="true" />
                {label.name}
              </span>
            )
        ))}
      </div>

      {selectedGiteaProject?.mergeStatus && (
        <ProjectMergePop
          selectedGiteaProject={selectedGiteaProject}
          setSelectedGiteaProject={setSelectedGiteaProject}

        />
      )}

      {/* advanced and some of the functions are for future use - current sycn is project wise and future is file wise */}
      {!advacnedOption
        && (
          <GridRow
            title={`${repo?.name} (${repo.name.split('-').pop().replaceAll('_', ' ')})`}
            lastSync={undefined}
            selected
            isUpload={selectedGiteaProject?.repo?.name === repo?.name && syncProgress.syncStarted}
            uploadPercentage={(syncProgress.completedFiles * 100) / syncProgress.totalFiles}
          />
      )}
    </>
    )
  );
};
export default GiteaFileBrowser;
