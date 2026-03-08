-- Add token_configs table for Token management

-- Create token_configs table
CREATE TABLE token_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    max_context_tokens INTEGER DEFAULT 4096,
    reserved_tokens INTEGER DEFAULT 1000,
    compression_config JSONB DEFAULT '{"enable_compression": true, "compression_ratio": 0.7, "summary_model": "gpt-3.5-turbo"}',
    priority_weights JSONB DEFAULT '{"temporal": 0.3, "relevance": 0.4, "importance": 0.2, "user_preference": 0.1}',
    auto_optimization BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_token_configs_project_id ON token_configs(project_id);
CREATE UNIQUE INDEX idx_token_configs_project_unique ON token_configs(project_id);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_token_configs_updated_at BEFORE UPDATE ON token_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE token_configs IS 'Token management configuration for projects';
COMMENT ON COLUMN token_configs.max_context_tokens IS 'Maximum number of tokens for context window';
COMMENT ON COLUMN token_configs.reserved_tokens IS 'Reserved tokens for system messages and completions';
COMMENT ON COLUMN token_configs.compression_config IS 'Configuration for context compression';
COMMENT ON COLUMN token_configs.priority_weights IS 'Weights for prioritizing memory items';
COMMENT ON COLUMN token_configs.auto_optimization IS 'Enable automatic token optimization';
