import yaml from 'yaml';
import path from 'path';
import fs from 'fs';
import ModulesConfigC from '../class/ModulesConfig.class';

export const ModulesConfig = ModulesConfigC.getInstance().getData();