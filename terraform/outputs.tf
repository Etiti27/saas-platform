output "cluster_name" {
  value       = module.eks.cluster_name
  description = "SaaS Cluster Name"
}

output "cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "SaaS Endpoint for EKS control plane"
}

output "node_group_arn" {
  description = "ARN of the EKS managed node group"
  value       = module.eks.eks_managed_node_groups["default"].node_group_arn
}




output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "region" {
  description = "AWS region"
  value       = var.region
}


